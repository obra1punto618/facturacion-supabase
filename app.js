// 🔥 CONFIGURACIÓN SUPABASE (tus datos)
const supabaseUrl = "https://kunjhqdsjntdivsvktxs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmpocWRzam50ZGl2c3ZrdHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzc2MjYsImV4cCI6MjA4MDQ1MzYyNn0.aJYeXRUDrgMIhWn5y-jLGppwk58x7TQFF7UqGScWuwg";

const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// 📌 BUCKET
const BUCKET = "FACTURACION";

// ----------------------------------------------------------
// SUBIR ARCHIVOS AL STORAGE
// ----------------------------------------------------------

async function subirArchivo(file, carpeta) {
    if (!file) return null;

    const nombre = `${carpeta}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(nombre, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        console.error(error);
        alert("Error subiendo archivo: " + error.message);
        return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(nombre);
    return urlData.publicUrl;
}

// ----------------------------------------------------------
// GUARDAR EN LA TABLA FACTURAS
// ----------------------------------------------------------

async function guardarRegistro(obra, partida, facturaUrl, pagoUrl) {
    const { data, error } = await supabase
        .from("facturas")
        .insert([
            {
                obra,
                partida,
                factura_url: facturaUrl,
                pago_url: pagoUrl
            }
        ]);

    if (error) {
        console.error(error);
        alert("Error guardando en tabla: " + error.message);
        return;
    }

    cargarFacturas();
}

// ----------------------------------------------------------
// CARGAR FACTURAS
// ----------------------------------------------------------

async function cargarFacturas() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "Cargando...";

    const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        lista.innerHTML = "Error cargando facturas.";
        return;
    }

    lista.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "factura-card";

        card.innerHTML = `
            <strong>Obra:</strong> ${item.obra}<br>
            <strong>Partida:</strong> ${item.partida}<br><br>

            <strong>Factura:</strong><br>
            <a href="${item.factura_url}" target="_blank">Ver archivo</a><br><br>

            <strong>Pago:</strong><br>
            <a href="${item.pago_url}" target="_blank">Ver archivo</a><br><br>
        `;

        lista.appendChild(card);
    });
}

// ----------------------------------------------------------
// EVENTO DEL BOTÓN
// ----------------------------------------------------------

document.getElementById("btnSubir").addEventListener("click", async () => {

    const obra = document.getElementById("obra").value;
    const partida = document.getElementById("partida").value;
    const factura_file = document.getElementById("factura_file").files[0];
    const pago_file = document.getElementById("pago_file").files[0];

    if (!obra || !partida || !factura_file) {
        alert("La obra, partida y factura son obligatorias.");
        return;
    }

    // Subidas al Storage
    const facturaUrl = await subirArchivo(factura_file, "facturas");
    const pagoUrl = pago_file ? await subirArchivo(pago_file, "pagos") : null;

    // Guardar en Tabla
    await guardarRegistro(obra, partida, facturaUrl, pagoUrl);

    alert("Factura registrada correctamente");
});

// Cargar facturas al entrar
cargarFacturas();
