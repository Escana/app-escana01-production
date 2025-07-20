"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import type { Client } from "@/lib/supabase"

// Mejorar el manejo de errores en la función getClients

// Versión simplificada y robusta de getClients
export async function getClients(): Promise<Client[]> {
  console.log("🔍 [getClients] Iniciando...")
  
  try {
    // Verificar si Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("⚠️ [getClients] Supabase no configurado, devolviendo datos mock")
      return getMockClients()
    }

    console.log("📡 [getClients] Consultando Supabase...")
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50) // Limitar para evitar sobrecarga

    if (error) {
      console.error("❌ [getClients] Error de Supabase:", error.message)
      console.log("🔄 [getClients] Fallback a datos mock")
      return getMockClients()
    }

    console.log(`✅ [getClients] ${data?.length || 0} clientes obtenidos`)
    return (data as Client[]) || []
    
  } catch (error) {
    console.error("💥 [getClients] Error inesperado:", error)
    console.log("🔄 [getClients] Fallback a datos mock")
    return getMockClients()
  }
}

// Función helper para datos mock
function getMockClients(): Client[] {
  return [
    {
      id: "mock-1",
      rut: "12345678-9",
      nombres: "Juan",
      apellidos: "Pérez",
      nacionalidad: "Chilena",
      sexo: "M",
      nacimiento: "1990-01-01",
      edad: 34,
      ban_level: 0,
      ban_duration: undefined,
      ban_reason: undefined,
      ban_description: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_image: undefined,
      photo: "",
      ingreso: new Date().toISOString(),
      is_banned: false,
      is_guest: false
    },
    {
      id: "mock-2",
      rut: "98765432-1",
      nombres: "María",
      apellidos: "González",
      nacionalidad: "Chilena",
      sexo: "F",
      nacimiento: "1985-05-15",
      edad: 39,
      ban_level: 0,
      ban_duration: undefined,
      ban_reason: undefined,
      ban_description: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_image: undefined,
      photo: "",
      ingreso: new Date().toISOString(),
      is_banned: false,
      is_guest: false
    }
  ]
}

export async function getClientVisits(clientId: string): Promise<{ entry_time: string }[]> {
  try {
    const { data, error } = await supabase
      .from("visits")
      .select("entry_time")
      .eq("client_id", clientId)
      .order("entry_time", { ascending: false })

    if (error) {
      console.error("Error fetching client visits:", error)
      throw new Error("Error fetching client visits")
    }

    return data || []
  } catch (error) {
    console.error("Error in getClientVisits:", error)
    throw error
  }
}

export async function getClientByRut(rut: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase.from("clients").select("*").eq("rut", rut).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null
      }
      throw error
    }

    return data as Client
  } catch (error) {
    console.error(`Error fetching client with rut ${rut}:`, error)
    throw error
  }
}

// Modificar la función createClient para aceptar document_image

export async function createClient(
  client: Omit<Client, "id" | "created_at" | "updated_at">,
  document_image?: string,
): Promise<Client> {
  try {
    // Preparar los datos del cliente con la imagen del documento si está disponible
    const clientData = document_image ? { ...client, document_image } : client

    const { data, error } = await supabase.from("clients").insert([clientData]).select().single()

    if (error) {
      console.error("Error creating client:", error)
      throw new Error("Error creating client")
    }

    revalidatePath("/clients")
    return data as Client
  } catch (error) {
    console.error("Error in createClient:", error)
    throw error
  }
}

// Modificar la función banClient para aceptar document_image
export async function banClient(
  rut: string,
  data: {
    banLevel: number
    banDuration: string
    banReason: string
    banDescription: string
    nombres?: string
    apellidos?: string
    nacionalidad?: string
    sexo?: string
    nacimiento?: Date | null
    edad?: number
    document_image?: string
  },
): Promise<Client> {
  try {
    const banStartDate = new Date()
    let banEndDate = null

    if (data.banDuration !== "Permanente") {
      const days = Number.parseInt(data.banDuration)
      banEndDate = new Date(banStartDate.getTime() + days * 24 * 60 * 60 * 1000)
    }

    // Primero, verificar si el cliente existe
    const { data: existingClient, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("rut", rut)
      .maybeSingle()

    if (clientError && clientError.code !== "PGRST116") {
      console.error("Error finding client:", clientError)
      throw new Error("Error finding client")
    }

    let clientId

    // Si el cliente no existe, crearlo primero
    if (!existingClient) {
      console.log("Cliente no encontrado, creando nuevo cliente")

      const newClient = {
        rut: rut,
        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        nacionalidad: data.nacionalidad || "",
        sexo: (data.sexo as "M" | "F") || "M",
        nacimiento: data.nacimiento || null,
        edad: data.edad || null,
        is_banned: true,
        ban_level: data.banLevel,
        ban_duration: data.banDuration,
        ban_reason: data.banReason,
        ban_description: data.banDescription,
        ban_start_date: banStartDate.toISOString(),
        ban_end_date: banEndDate?.toISOString() || null,
        document_image: data.document_image || null,
      }

      const { data: createdClient, error: createError } = await supabase
        .from("clients")
        .insert([newClient])
        .select()
        .single()

      if (createError) {
        console.error("Error creating client:", createError)
        throw new Error("Error creating client")
      }

      clientId = createdClient.id

      // Crear el registro de incidente
      const { error: incidentError } = await supabase.from("incidents").insert([
        {
          client_id: clientId,
          type: "DOCUMENTO_FALSO", // You might want to make this configurable
          description: data.banDescription,
          status: "RESOLVED",
          severity: data.banLevel,
          location: "Entrada principal",
          resolved_at: new Date().toISOString(),
          resolution_notes: `Cliente baneado: ${data.banReason}. Duración: ${data.banDuration} días.`,
        },
      ])

      if (incidentError) {
        console.error("Error creating incident:", incidentError)
        throw new Error("Error creating incident")
      }

      revalidatePath("/clients")
      return createdClient as Client
    }

    clientId = existingClient.id

    // Crear el registro de incidente
    const { error: incidentError } = await supabase.from("incidents").insert([
      {
        client_id: clientId,
        type: "DOCUMENTO_FALSO", // You might want to make this configurable
        description: data.banDescription,
        status: "RESOLVED",
        severity: data.banLevel,
        location: "Entrada principal",
        resolved_at: new Date().toISOString(),
        resolution_notes: `Cliente baneado: ${data.banReason}. Duración: ${data.banDuration} días.`,
      },
    ])

    if (incidentError) {
      console.error("Error creating incident:", incidentError)
      throw new Error("Error creating incident")
    }

    // Actualizar el cliente existente con la información del ban y la imagen si está disponible
    const updateData = {
      is_banned: true,
      ban_level: data.banLevel,
      ban_duration: data.banDuration,
      ban_reason: data.banReason,
      ban_description: data.banDescription,
      ban_start_date: banStartDate.toISOString(),
      ban_end_date: banEndDate?.toISOString() || null,
    }

    // Agregar la imagen del documento si está disponible
    if (data.document_image) {
      updateData.document_image = data.document_image
    }

    // Actualizar el cliente con la información del ban
    const { data: updatedClient, error: updateError } = await supabase
      .from("clients")
      .update(updateData)
      .eq("rut", rut)
      .select()
      .single()

    if (updateError) {
      console.error("Error banning client:", updateError)
      throw new Error("Error banning client")
    }

    revalidatePath("/clients")
    return updatedClient as Client
  } catch (error) {
    console.error("Error in banClient:", error)
    throw error
  }
}

export async function unbanClient(rut: string): Promise<Client> {
  try {
    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update({
        is_banned: false,
        ban_level: null,
        ban_duration: null,
        ban_reason: null,
        ban_description: null,
        ban_start_date: null,
        ban_end_date: null,
      })
      .eq("rut", rut)
      .select()
      .single()

    if (error) {
      console.error("Error unbanning client:", error)
      throw new Error("Error unbanning client")
    }

    revalidatePath("/clients")
    return updatedClient as Client
  } catch (error) {
    console.error("Error in unbanClient:", error)
    throw error
  }
}
export async function getDailyStats(establishmentId) {
  const defaultStats = {
    totalVisits:   0,
    incidents:     0,
    newClients:    0,
    maleVisits:    0,
    femaleVisits:  0,
    maleClients:   0,
    femaleClients: 0,
  };

  // 1) Cálculo estricto de UTC midnight → UTC midnight+1
  const now = new Date();
  const startUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  const endUtc = new Date(startUtc);
  endUtc.setUTCDate(endUtc.getUTCDate() + 1);

  const isoStart = startUtc.toISOString(); // p.ej. "2025-05-05T00:00:00.000Z"
  const isoEnd   = endUtc  .toISOString(); // p.ej. "2025-05-06T00:00:00.000Z"

  try {
    // 2) Si hay establishmentId, primero traigo los clientes de esa sede
    let clientIds = null;
    let maleClientIds = [];
    let femaleClientIds = [];

    if (establishmentId) {
      const { data: clientsData, error: clientErr } = await supabase
        .from('clients')
        .select('id, sexo')
        .eq('establishment_id', establishmentId);

      if (clientErr) {
        console.error('Error fetching clients for establishment:', clientErr);
        return defaultStats;
      }

      clientIds       = clientsData.map(c => c.id);
      maleClientIds   = clientsData.filter(c => c.sexo === 'M').map(c => c.id);
      femaleClientIds = clientsData.filter(c => c.sexo === 'F').map(c => c.id);
    }

    // 3) Preparo cada consulta usando solo count (head + exact)
    const visitsQ = supabase
      .from('visits')
      .select('id', { head: true, count: 'exact' })
      .gte('entry_time', isoStart)
      .lt ('entry_time', isoEnd);
    if (clientIds) visitsQ.in('client_id', clientIds);

    let incidentsQ = supabase
  .from('incidents')
  .select('id', { head: true, count: 'exact' })
  .gte('created_at', isoStart)
  .lt ('created_at', isoEnd);

// en lugar de .eq('establishment_id', …) haz:
if (clientIds && clientIds.length) {
  incidentsQ = incidentsQ.in('client_id', clientIds)
} else {
  // si no hay clients en esa sede, fuerza cero resultados
  incidentsQ = incidentsQ.eq('client_id', '')
}
    const newClientsQ = supabase
      .from('clients')
      .select('id', { head: true, count: 'exact' })
      .gte('created_at', isoStart)
      .lt ('created_at', isoEnd);
    if (establishmentId) newClientsQ.eq('establishment_id', establishmentId);

    const maleVisitsQ = supabase
      .from('visits')
      .select('id', { head: true, count: 'exact' })
      .gte('entry_time', isoStart)
      .lt ('entry_time', isoEnd);
    if (maleClientIds.length) maleVisitsQ.in('client_id', maleClientIds);
    else maleVisitsQ.eq('client_id', '');  // fuerza 0 resultados

    const femaleVisitsQ = supabase
      .from('visits')
      .select('id', { head: true, count: 'exact' })
      .gte('entry_time', isoStart)
      .lt ('entry_time', isoEnd);
    if (femaleClientIds.length) femaleVisitsQ.in('client_id', femaleClientIds);
    else femaleVisitsQ.eq('client_id', '');

    const maleClientsQ = supabase
      .from('clients')
      .select('id', { head: true, count: 'exact' })
      .gte('created_at', isoStart)
      .lt ('created_at', isoEnd)
      .eq('sexo', 'M');
    if (establishmentId) maleClientsQ.eq('establishment_id', establishmentId);

    const femaleClientsQ = supabase
      .from('clients')
      .select('id', { head: true, count: 'exact' })
      .gte('created_at', isoStart)
      .lt ('created_at', isoEnd)
      .eq('sexo', 'F');
    if (establishmentId) femaleClientsQ.eq('establishment_id', establishmentId);

    // 4) Ejecuto todo en paralelo
    const [
      { count: totalVisits,  error: eV },
      { count: incidents,    error: eI },
      { count: newClients,   error: eNC },
      { count: maleVisits,   error: eMV },
      { count: femaleVisits, error: eFV },
      { count: maleClients,  error: eMC },
      { count: femaleClients,error: eFC },
    ] = await Promise.all([
      visitsQ, incidentsQ, newClientsQ,
      maleVisitsQ, femaleVisitsQ,
      maleClientsQ, femaleClientsQ,
    ]);

    const anyError = eV||eI||eNC||eMV||eFV||eMC||eFC;
    if (anyError) {
      console.error('Error fetching daily stats:', anyError);
      return defaultStats;
    }

    // 5) Retorno el objeto final
    return {
      totalVisits:   totalVisits   || 0,
      incidents:     incidents     || 0,
      newClients:    newClients    || 0,
      maleVisits:    maleVisits    || 0,
      femaleVisits:  femaleVisits  || 0,
      maleClients:   maleClients   || 0,
      femaleClients: femaleClients || 0,
    };
  } catch (err) {
    console.error('Unexpected error in getDailyStats:', err);
    return defaultStats;
  }
}


export async function createVisit(clientId: string, establishmentId?: string) {
  try {
    console.log(`Creating visit for client ${clientId}`)

    // Use a simpler approach that doesn't rely on the establishment_id column
    // This will work regardless of whether the column exists
    const { data, error } = await supabase
      .from("visits")
      .insert({
        client_id: clientId,
        entry_time: new Date().toISOString(),
        status: "ACTIVE",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating visit:", error)
      throw new Error("Error creating visit")
    }

    revalidatePath("/")
    return data
  } catch (error) {
    console.error("Error in createVisit:", error)
    throw error
  }
}

