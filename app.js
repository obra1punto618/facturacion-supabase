const SUPABASE_URL = "https://kunjhqdsjntdivsvktxs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmpocWRzam50ZGl2c3ZrdHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzc2MjYsImV4cCI6MjA4MDQ1MzYyNn0.aJYeXRUDrgMIhWn5y-jLGppwk58x7TQFF7UqGScWuwg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById("facturaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const obra = document.getElementById("obra").value;
  const partida = document.getElementById("partida").value;
  const facturaFile = document.getElementById("factura").files[0];

  if (!facturaFile) {
    alert("Sube una imagen o PDF.");
    return;
  }

  // 1. Subir archivo a Storage -> carpeta FACTURAS dentro del bucket FACTURACION
  const filePath = `FACTURAS/${Date.now()}_${facturaFile.name}`;

  let { data: fileData, error: fileError } = await supabaseClient.storage
    .from("FACTURACION")   // ← Bucket correcto
    .upload(filePath, facturaFile);

  if (fileError) {
    alert("❌ Error subiendo archivo");
    console.log(fileError);
    return;
  }

  // 2. Registrar en la tabla facturas
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
