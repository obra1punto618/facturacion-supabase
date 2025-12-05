// -----------------------------------------------------
// CONFIGURACIÓN SUPABASE (tu URL y ANON KEY)
// -----------------------------------------------------
const SUPABASE_URL = "https://kunjhqdsjntdivsvktxs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmpocWRzam50ZGl2c3ZrdHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzc2MjYsImV4cCI6MjA4MDQ1MzYyNn0.aJYeXRUDrgMIhWn5y-jLGppwk58x7TQFF7UqGScWuwg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// -----------------------------------------------------
// EVENTO DEL FORMULARIO
// -----------------------------------------------------
document.getElementById("facturaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const obra = document.getElementById("obra").value;
  const partida = document.getElementById("partida").value;
  const facturaFile = document.getElementById("factura").files[0];

  if (!facturaFile) {
    alert("❌ Debes subir una imagen o PDF de factura.");
    return;
  }

  // -----------------------------------------------------
  // 1. LIMPIAR NOMBRE DEL ARCHIVO (EVITA ERROR 400)
  // -----------------------------------------------------
  const sanitizedName = facturaFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const filePath = `FACTURAS/${Date.now()}_${sanitizedName}`;

  // -----------------------------------------------------
  // 2. SUBIR ARCHIVO AL BUCKET FACTURACION
  // -----------------------------------------------------
  let { data: fileData, error: fileError } = await supabaseClient.storage
    .from("FACTURACION") // bucket correcto
    .upload(filePath, facturaFile);

  if (fileError) {
    alert("❌ Error subiendo archivo");
    console.log(fileError);
    return;
  }

  // -----------------------------------------------------
  // 3. GUARDAR REGISTRO EN LA TABLA facturas
  // -----------------------------------------------------
  const { data, error } = await supabaseClient
    .from("facturas")
    .insert([
      {
        obra,
        partida,
        archivo_url: fileData.path,
        estado: "Pendiente"
      }
    ]);

  if (error) {
    alert("❌ Error guardando registro");
    console.log(error);
    return;
  }

  alert("✅ Factura subida correctamente");
  document.getElementById("facturaForm").reset();
});
