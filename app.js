const SUPABASE_URL = "https://kunjhqdsjntdivsvktxs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmpocWRzam50ZGl2c3ZrdHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzc2MjYsImV4cCI6MjA4MDQ1MzYyNn0.aJYeXRUDrgMIhWn5y-jLGppwk58x7TQFF7UqGScWuwg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById("facturaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const obra = document.getElementById("obra").value;
  const partida = document.getElementById("partida").value;
  const facturaFile = document.getElementById("factura").files[0];

  if (!facturaFile) {
    alert("Debes subir un archivo de factura.");
    return;
  }

  // ----------------------------
  // 1. SUBIR ARCHIVO A STORAGE
  // ----------------------------
  const safeName = facturaFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `FACTURAS/${Date.now()}_${safeName}`;

  let { data: fileData, error: fileError } = await supabaseClient.storage
    .from("FACTURAS") // nombre EXACTO del bucket
    .upload(filePath, facturaFile);

  if (fileError) {
    console.error(fileError);
    alert("❌ Error subiendo el archivo a Supabase Storage");
    return;
  }

  // ----------------------------
  // 2. GUARDAR REGISTRO EN TABLA
  // ----------------------------
  const { data, error } = await supabaseClient
    .from("facturas")
    .insert([
      {
        obra: obra,
        partida: partida,
        monto: 0,                // o pon null si prefieres
        estado: "Pendiente",
        factura_url: fileData.path,
        abono_url: null,
        usuario: "web",
        fecha: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error(error);
    alert("❌ Error guardando registro en la tabla");
    return;
  }

  alert("✅ Factura registrada correctamente");
  document.getElementById("facturaForm").reset();
});
