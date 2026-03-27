#!/usr/bin/env python3
"""Generate Nivo Brand Identity PDF from the new shadcn/Zinc color system."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus.flowables import HRFlowable
import os

# ── Paths ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(BASE_DIR, "Nivo_Brand_Identity.pdf")

# ── Brand Colors ──────────────────────────────────────────────────────
Z950 = HexColor("#09090b")
Z900 = HexColor("#18181b")
Z800 = HexColor("#27272a")
Z700 = HexColor("#3f3f46")
Z600 = HexColor("#52525b")
Z500 = HexColor("#71717a")
Z400 = HexColor("#a1a1aa")
Z300 = HexColor("#d4d4d8")
Z200 = HexColor("#e4e4e7")
Z100 = HexColor("#f4f4f5")
Z50 = HexColor("#fafafa")
WHITE = HexColor("#ffffff")

SUCCESS_D = HexColor("#22c55e")
SUCCESS_L = HexColor("#16a34a")
WARNING_D = HexColor("#eab308")
WARNING_L = HexColor("#ca8a04")
DESTRUCT_D = HexColor("#7f1d1d")
DESTRUCT_L = HexColor("#ef4444")
INFO_D = HexColor("#3b82f6")
INFO_L = HexColor("#2563eb")


# ── Styles ────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

s_cover_title = ParagraphStyle(
    "CoverTitle",
    parent=styles["Title"],
    fontSize=36,
    leading=44,
    textColor=Z50,
    spaceAfter=12,
    alignment=TA_LEFT,
    fontName="Helvetica-Bold",
)
s_cover_sub = ParagraphStyle(
    "CoverSub",
    parent=styles["Normal"],
    fontSize=14,
    leading=20,
    textColor=Z400,
    spaceAfter=6,
    alignment=TA_LEFT,
    fontName="Helvetica",
)

s_h1 = ParagraphStyle(
    "H1",
    parent=styles["Heading1"],
    fontSize=26,
    leading=32,
    textColor=Z950,
    spaceBefore=24,
    spaceAfter=12,
    fontName="Helvetica-Bold",
)
s_h2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontSize=18,
    leading=24,
    textColor=Z950,
    spaceBefore=18,
    spaceAfter=8,
    fontName="Helvetica-Bold",
)
s_h3 = ParagraphStyle(
    "H3",
    parent=styles["Heading3"],
    fontSize=14,
    leading=18,
    textColor=Z700,
    spaceBefore=12,
    spaceAfter=6,
    fontName="Helvetica-Bold",
)
s_body = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    leading=15,
    textColor=Z900,
    spaceAfter=6,
    fontName="Helvetica",
)
s_body_bold = ParagraphStyle(
    "BodyBold",
    parent=s_body,
    fontName="Helvetica-Bold",
)
s_caption = ParagraphStyle(
    "Caption",
    parent=styles["Normal"],
    fontSize=8,
    leading=11,
    textColor=Z500,
    spaceAfter=4,
    fontName="Helvetica",
)
s_code = ParagraphStyle(
    "Code",
    parent=styles["Normal"],
    fontSize=9,
    leading=13,
    textColor=Z900,
    fontName="Courier",
    spaceAfter=4,
    leftIndent=12,
)
s_bullet = ParagraphStyle(
    "Bullet",
    parent=s_body,
    leftIndent=18,
    bulletIndent=6,
    bulletFontName="Helvetica",
    bulletFontSize=10,
)


# ── Helpers ───────────────────────────────────────────────────────────
def hr():
    return HRFlowable(
        width="100%", thickness=0.5, color=Z200, spaceAfter=10, spaceBefore=10
    )


def spacer(h=12):
    return Spacer(1, h)


def bullet(text):
    return Paragraph(f"• {text}", s_bullet)


def color_swatch_row(name, hex_val, hsl_val, rgb_val, usage, color_obj):
    """Return a table row with a colored swatch."""
    swatch_data = [[""]]
    swatch = Table(swatch_data, colWidths=[28], rowHeights=[28])
    swatch.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, 0), color_obj),
                ("BOX", (0, 0), (0, 0), 0.5, Z300),
                ("VALIGN", (0, 0), (0, 0), "MIDDLE"),
            ]
        )
    )
    return [
        swatch,
        Paragraph(f"<b>{name}</b>", s_body_bold),
        Paragraph(hex_val, s_code),
        Paragraph(hsl_val, s_caption),
        Paragraph(usage, s_caption),
    ]


def color_table(rows):
    """Build a styled color table from swatch rows."""
    header = [
        Paragraph("", s_caption),
        Paragraph("<b>Token</b>", s_caption),
        Paragraph("<b>HEX</b>", s_caption),
        Paragraph("<b>HSL</b>", s_caption),
        Paragraph("<b>Uso</b>", s_caption),
    ]
    data = [header] + rows
    t = Table(data, colWidths=[36, 100, 70, 130, 160])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


# ── Document Build ────────────────────────────────────────────────────
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="Nivo — Identidad de Marca",
        author="Nivo",
    )

    story = []

    # ═══════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 180))
    story.append(
        Paragraph(
            "Nivo",
            ParagraphStyle(
                "CoverTitle",
                parent=styles["Title"],
                fontSize=42,
                leading=50,
                textColor=Z950,
                alignment=TA_LEFT,
                fontName="Helvetica-Bold",
            ),
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "Identidad de Marca",
            ParagraphStyle(
                "CoverTitle2",
                parent=styles["Title"],
                fontSize=24,
                leading=30,
                textColor=Z500,
                alignment=TA_LEFT,
                fontName="Helvetica-Bold",
            ),
        )
    )
    story.append(Spacer(1, 36))
    story.append(HRFlowable(width="40%", thickness=2, color=Z950, spaceAfter=16))
    story.append(
        Paragraph(
            "Sistema de Diseño · Zinc / shadcn",
            ParagraphStyle(
                "CoverSub",
                parent=styles["Normal"],
                fontSize=13,
                leading=18,
                textColor=Z500,
                fontName="Helvetica",
            ),
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Marzo 2026",
            ParagraphStyle(
                "CoverDate",
                parent=styles["Normal"],
                fontSize=12,
                leading=16,
                textColor=Z400,
                fontName="Helvetica",
            ),
        )
    )
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════
    # 1. NOMBRE Y CONCEPTO
    # ═══════════════════════════════════════════════════════════════════
    story.append(Paragraph("1. Nombre y Concepto de Marca", s_h1))
    story.append(hr())
    story.append(
        Paragraph(
            "<b>Nivo</b> = <b>Neo</b> (nuevo, renovado) + <b>Parking</b> (estacionamiento)",
            s_body,
        )
    )
    story.append(spacer(8))
    story.append(Paragraph("Concepto Central", s_h3))
    story.append(
        Paragraph(
            "Nivo representa la evolución del estacionamiento tradicional hacia una experiencia "
            "digital inteligente. La marca comunica modernidad, eficiencia y confiabilidad para operadores "
            "de parqueaderos que buscan optimizar sus operaciones mediante tecnología SaaS multi-inquilino.",
            s_body,
        )
    )
    story.append(spacer(8))
    story.append(Paragraph("Propuesta de Valor", s_h3))
    story.append(
        Paragraph(
            '"Gestión inteligente de parqueaderos. Automatización completa, control total."',
            ParagraphStyle(
                "Quote", parent=s_body, fontName="Helvetica-BoldOblique", leftIndent=12
            ),
        )
    )

    # ═══════════════════════════════════════════════════════════════════
    # 2. PERSONALIDAD DE MARCA
    # ═══════════════════════════════════════════════════════════════════
    story.append(spacer(16))
    story.append(Paragraph("2. Personalidad de Marca", s_h1))
    story.append(hr())
    story.append(Paragraph("Adjetivos Clave", s_h3))
    for adj, desc in [
        ("Tecnológico", "Innovador pero accesible"),
        ("Confiable", "Profesional y robusto"),
        ("Eficiente", "Enfocado en resultados y optimización"),
        ("Minimalista", "Austero, limpio, sin ruido visual"),
        ("Preciso", "Sistemático, orientado a datos"),
    ]:
        story.append(bullet(f"<b>{adj}</b> — {desc}"))

    story.append(spacer(8))
    story.append(Paragraph("Posicionamiento", s_h3))
    story.append(
        Paragraph(
            "Nivo se posiciona como la plataforma SaaS profesional para PyMEs y operadores "
            "independientes de estacionamientos que buscan digitalizar y automatizar sus operaciones "
            "con una estética minimalista, limpia y de alto contraste.",
            s_body,
        )
    )

    # ═══════════════════════════════════════════════════════════════════
    # 3. PALETA DE COLORES
    # ═══════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("3. Paleta de Colores — Sistema Zinc (shadcn)", s_h1))
    story.append(hr())
    story.append(
        Paragraph(
            "Nivo adopta un sistema visual inspirado en shadcn/ui: neutros basados en la escala "
            "Zinc de Tailwind CSS, componentes de alto contraste y colores semánticos reservados "
            "exclusivamente para estados funcionales. El color es informativo, no decorativo.",
            s_body,
        )
    )

    # ── Zinc Scale ────────────────────────────────────────────────────
    story.append(spacer(8))
    story.append(Paragraph("Escala Zinc Completa", s_h2))
    zinc_data = [
        ["zinc-50", "#fafafa", Z50],
        ["zinc-100", "#f4f4f5", Z100],
        ["zinc-200", "#e4e4e7", Z200],
        ["zinc-300", "#d4d4d8", Z300],
        ["zinc-400", "#a1a1aa", Z400],
        ["zinc-500", "#71717a", Z500],
        ["zinc-600", "#52525b", Z600],
        ["zinc-700", "#3f3f46", Z700],
        ["zinc-800", "#27272a", Z800],
        ["zinc-900", "#18181b", Z900],
        ["zinc-950", "#09090b", Z950],
    ]
    zinc_rows = []
    for name, hex_v, cobj in zinc_data:
        swatch_data = [[""]]
        swatch = Table(swatch_data, colWidths=[24], rowHeights=[16])
        txt_c = white if cobj.hexval()[2:] < "888888" else Z950
        swatch.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, 0), cobj),
                    ("BOX", (0, 0), (0, 0), 0.5, Z300),
                ]
            )
        )
        zinc_rows.append([swatch, Paragraph(name, s_caption), Paragraph(hex_v, s_code)])

    zinc_header = [
        Paragraph("", s_caption),
        Paragraph("<b>Token</b>", s_caption),
        Paragraph("<b>HEX</b>", s_caption),
    ]
    zt = Table([zinc_header] + zinc_rows, colWidths=[36, 80, 80])
    zt.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
            ]
        )
    )
    story.append(zt)

    # ── Dark Theme ────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Tema Oscuro", s_h2))
    story.append(Paragraph("Neutros Base", s_h3))

    dark_neutral_rows = [
        color_swatch_row(
            "Background",
            "#09090b",
            "hsl(240,10%,3.9%)",
            "(9,9,11)",
            "Fondo principal",
            Z950,
        ),
        color_swatch_row(
            "Card",
            "#09090b",
            "hsl(240,10%,3.9%)",
            "(9,9,11)",
            "Tarjetas (borde sutil)",
            Z950,
        ),
        color_swatch_row(
            "Foreground",
            "#fafafa",
            "hsl(0,0%,98%)",
            "(250,250,250)",
            "Texto principal",
            Z50,
        ),
        color_swatch_row(
            "Muted FG",
            "#a1a1aa",
            "hsl(240,4.9%,65.1%)",
            "(161,161,170)",
            "Labels, placeholders",
            Z400,
        ),
        color_swatch_row(
            "Muted",
            "#27272a",
            "hsl(240,3.7%,15.9%)",
            "(39,39,42)",
            "Badges, áreas inactivas",
            Z800,
        ),
    ]
    story.append(color_table(dark_neutral_rows))

    story.append(spacer(8))
    story.append(Paragraph("Componentes", s_h3))
    dark_comp_rows = [
        color_swatch_row(
            "Primary", "#fafafa", "—", "—", "Botón principal (fondo)", Z50
        ),
        color_swatch_row(
            "Primary FG", "#18181b", "—", "—", "Texto sobre primary", Z900
        ),
        color_swatch_row("Secondary", "#27272a", "—", "—", "Botón secundario", Z800),
        color_swatch_row("Border", "#27272a", "—", "—", "Bordes, divisores", Z800),
        color_swatch_row("Ring", "#d4d4d8", "—", "—", "Focus ring", Z300),
    ]
    story.append(color_table(dark_comp_rows))

    story.append(spacer(8))
    story.append(Paragraph("Estados Semánticos", s_h3))
    dark_sem_rows = [
        color_swatch_row(
            "Destructive",
            "#7f1d1d",
            "hsl(0,62.8%,30.6%)",
            "(127,29,29)",
            "Errores, plazas ocupadas",
            DESTRUCT_D,
        ),
        color_swatch_row(
            "Success",
            "#22c55e",
            "hsl(142.1,70.6%,45.3%)",
            "(34,197,94)",
            "Disponible, confirmación",
            SUCCESS_D,
        ),
        color_swatch_row(
            "Warning",
            "#eab308",
            "hsl(47.9,95.8%,53.1%)",
            "(234,179,8)",
            "Advertencias, reservas",
            WARNING_D,
        ),
        color_swatch_row(
            "Info",
            "#3b82f6",
            "hsl(217.2,91.2%,59.8%)",
            "(59,130,246)",
            "Informativos, datos",
            INFO_D,
        ),
    ]
    story.append(color_table(dark_sem_rows))

    # ── Light Theme ───────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Tema Claro", s_h2))
    story.append(Paragraph("Neutros Base", s_h3))

    light_neutral_rows = [
        color_swatch_row(
            "Background",
            "#ffffff",
            "hsl(0,0%,100%)",
            "(255,255,255)",
            "Fondo principal",
            WHITE,
        ),
        color_swatch_row(
            "Card",
            "#ffffff",
            "hsl(0,0%,100%)",
            "(255,255,255)",
            "Tarjetas (borde sutil)",
            WHITE,
        ),
        color_swatch_row(
            "Foreground",
            "#09090b",
            "hsl(240,10%,3.9%)",
            "(9,9,11)",
            "Texto principal",
            Z950,
        ),
        color_swatch_row(
            "Muted FG",
            "#71717a",
            "hsl(240,3.8%,46.1%)",
            "(113,113,122)",
            "Labels, placeholders",
            Z500,
        ),
        color_swatch_row(
            "Muted",
            "#f4f4f5",
            "hsl(240,4.8%,95.9%)",
            "(244,244,245)",
            "Badges, áreas inactivas",
            Z100,
        ),
    ]
    story.append(color_table(light_neutral_rows))

    story.append(spacer(8))
    story.append(Paragraph("Componentes", s_h3))
    light_comp_rows = [
        color_swatch_row(
            "Primary", "#18181b", "—", "—", "Botón principal (fondo)", Z900
        ),
        color_swatch_row("Primary FG", "#fafafa", "—", "—", "Texto sobre primary", Z50),
        color_swatch_row("Secondary", "#f4f4f5", "—", "—", "Botón secundario", Z100),
        color_swatch_row("Border", "#e4e4e7", "—", "—", "Bordes, divisores", Z200),
        color_swatch_row("Ring", "#18181b", "—", "—", "Focus ring", Z900),
    ]
    story.append(color_table(light_comp_rows))

    story.append(spacer(8))
    story.append(Paragraph("Estados Semánticos", s_h3))
    light_sem_rows = [
        color_swatch_row(
            "Destructive",
            "#ef4444",
            "hsl(0,84.2%,60.2%)",
            "(239,68,68)",
            "Errores, plazas ocupadas",
            DESTRUCT_L,
        ),
        color_swatch_row(
            "Success",
            "#16a34a",
            "hsl(142.1,76.2%,36.3%)",
            "(22,163,74)",
            "Disponible, confirmación",
            SUCCESS_L,
        ),
        color_swatch_row(
            "Warning",
            "#ca8a04",
            "hsl(45.4,93.4%,47.5%)",
            "(202,138,4)",
            "Advertencias, reservas",
            WARNING_L,
        ),
        color_swatch_row(
            "Info",
            "#2563eb",
            "hsl(221.2,83.2%,53.3%)",
            "(37,99,235)",
            "Informativos, datos",
            INFO_L,
        ),
    ]
    story.append(color_table(light_sem_rows))

    # ── Distribution ──────────────────────────────────────────────────
    story.append(spacer(12))
    story.append(Paragraph("Distribución de Colores", s_h3))
    story.append(bullet("Neutros (Background / Foreground / Border): 80%"))
    story.append(bullet("Primary (blanco/negro invertido): 10%"))
    story.append(bullet("Semánticos (Success / Warning / Destructive / Info): 10%"))
    story.append(spacer(6))
    story.append(
        Paragraph(
            "<b>Principio clave:</b> El color es informativo, no decorativo. "
            "Los estados semánticos son los únicos elementos con color cromático.",
            s_body,
        )
    )

    # ── Accessibility ─────────────────────────────────────────────────
    story.append(spacer(12))
    story.append(Paragraph("Contraste y Accesibilidad", s_h3))

    acc_data = [
        [
            Paragraph("<b>Par</b>", s_caption),
            Paragraph("<b>Tema</b>", s_caption),
            Paragraph("<b>Ratio</b>", s_caption),
            Paragraph("<b>Nivel</b>", s_caption),
        ],
        [
            Paragraph("Foreground / Background", s_caption),
            Paragraph("Dark", s_caption),
            Paragraph("19.4:1", s_caption),
            Paragraph("AAA ✓", s_caption),
        ],
        [
            Paragraph("Muted FG / Background", s_caption),
            Paragraph("Dark", s_caption),
            Paragraph("7.5:1", s_caption),
            Paragraph("AAA ✓", s_caption),
        ],
        [
            Paragraph("Foreground / Background", s_caption),
            Paragraph("Light", s_caption),
            Paragraph("19.4:1", s_caption),
            Paragraph("AAA ✓", s_caption),
        ],
        [
            Paragraph("Muted FG / Background", s_caption),
            Paragraph("Light", s_caption),
            Paragraph("4.7:1", s_caption),
            Paragraph("AA ✓", s_caption),
        ],
        [
            Paragraph("Success / Background", s_caption),
            Paragraph("Dark", s_caption),
            Paragraph("8.2:1", s_caption),
            Paragraph("AAA ✓", s_caption),
        ],
        [
            Paragraph("Warning / Background", s_caption),
            Paragraph("Dark", s_caption),
            Paragraph("10.7:1", s_caption),
            Paragraph("AAA ✓", s_caption),
        ],
    ]
    acc_t = Table(acc_data, colWidths=[160, 50, 60, 60])
    acc_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
            ]
        )
    )
    story.append(acc_t)

    # ── CSS Variables ─────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Variables CSS — Tokens de Implementación", s_h2))
    story.append(spacer(4))
    story.append(Paragraph("Tema Oscuro", s_h3))
    css_dark = """<pre>
:root[data-theme="dark"], .dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 4.9% 65.1%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
  --radius: 0.5rem;
  --success: 142.1 70.6% 45.3%;
  --warning: 47.9 95.8% 53.1%;
  --info: 217.2 91.2% 59.8%;
}</pre>"""
    story.append(Paragraph(css_dark, s_code))

    story.append(spacer(8))
    story.append(Paragraph("Tema Claro", s_h3))
    css_light = """<pre>
:root, .light {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
  --success: 142.1 76.2% 36.3%;
  --warning: 45.4 93.4% 47.5%;
  --info: 221.2 83.2% 53.3%;
}</pre>"""
    story.append(Paragraph(css_light, s_code))

    # ═══════════════════════════════════════════════════════════════════
    # 4. TIPOGRAFÍA
    # ═══════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("4. Sistema Tipográfico", s_h1))
    story.append(hr())

    story.append(Paragraph("Fuente Principal: Inter", s_h2))
    story.append(bullet("Familia: Sans-serif geométrica"))
    story.append(bullet("Pesos: Thin (100) a Black (900), variable font"))
    story.append(bullet("Licencia: SIL Open Font License"))
    story.append(
        bullet("Uso: Títulos, cuerpo, UI (botones, labels, inputs), navegación")
    )
    story.append(spacer(4))
    story.append(
        Paragraph(
            "Inter es la fuente estándar de interfaces modernas y del ecosistema shadcn/ui. "
            "Diseñada para pantallas, con amplia variedad de pesos y soporte completo de OpenType features.",
            s_body,
        )
    )

    story.append(spacer(10))
    story.append(Paragraph("Fuente Monoespaciada: JetBrains Mono", s_h2))
    story.append(bullet("Familia: Monoespaciada"))
    story.append(bullet("Pesos: Thin (100) a ExtraBold (800)"))
    story.append(bullet("Licencia: SIL Open Font License"))
    story.append(
        bullet("Uso: Datos numéricos, placas vehiculares, código, datos técnicos")
    )

    story.append(spacer(10))
    story.append(Paragraph("Fuente del Logotipo: Space Mono Bold", s_h2))
    story.append(
        Paragraph(
            "Se mantiene Space Mono Bold exclusivamente para el logotipo/marca tipográfica. No se usa en UI.",
            s_body,
        )
    )

    # ── Type Hierarchy ────────────────────────────────────────────────
    story.append(spacer(12))
    story.append(Paragraph("Jerarquía Tipográfica", s_h2))

    type_data = [
        [
            Paragraph("<b>Nivel</b>", s_caption),
            Paragraph("<b>Fuente</b>", s_caption),
            Paragraph("<b>Tamaño</b>", s_caption),
            Paragraph("<b>Peso</b>", s_caption),
            Paragraph("<b>Line-height</b>", s_caption),
            Paragraph("<b>Tracking</b>", s_caption),
        ],
        [
            Paragraph("H1", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("48px / 3rem", s_caption),
            Paragraph("Bold (700)", s_caption),
            Paragraph("56px", s_caption),
            Paragraph("-1.2px", s_caption),
        ],
        [
            Paragraph("H2", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("36px / 2.25rem", s_caption),
            Paragraph("Semibold (600)", s_caption),
            Paragraph("44px", s_caption),
            Paragraph("-0.75px", s_caption),
        ],
        [
            Paragraph("H3", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("24px / 1.5rem", s_caption),
            Paragraph("Semibold (600)", s_caption),
            Paragraph("32px", s_caption),
            Paragraph("-0.5px", s_caption),
        ],
        [
            Paragraph("H4", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("20px / 1.25rem", s_caption),
            Paragraph("Medium (500)", s_caption),
            Paragraph("28px", s_caption),
            Paragraph("0", s_caption),
        ],
        [
            Paragraph("Body Large", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("16px / 1rem", s_caption),
            Paragraph("Regular (400)", s_caption),
            Paragraph("26px", s_caption),
            Paragraph("0", s_caption),
        ],
        [
            Paragraph("Body", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("14px / 0.875rem", s_caption),
            Paragraph("Regular (400)", s_caption),
            Paragraph("22px", s_caption),
            Paragraph("0", s_caption),
        ],
        [
            Paragraph("Caption", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("12px / 0.75rem", s_caption),
            Paragraph("Regular (400)", s_caption),
            Paragraph("18px", s_caption),
            Paragraph("0", s_caption),
        ],
        [
            Paragraph("Button", s_caption),
            Paragraph("Inter", s_caption),
            Paragraph("14px / 0.875rem", s_caption),
            Paragraph("Medium (500)", s_caption),
            Paragraph("20px", s_caption),
            Paragraph("0", s_caption),
        ],
        [
            Paragraph("Code/Data", s_caption),
            Paragraph("JetBrains Mono", s_caption),
            Paragraph("13px / 0.8125rem", s_caption),
            Paragraph("Regular (400)", s_caption),
            Paragraph("20px", s_caption),
            Paragraph("0", s_caption),
        ],
    ]
    type_t = Table(type_data, colWidths=[60, 80, 85, 80, 60, 55])
    type_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
            ]
        )
    )
    story.append(type_t)

    # ═══════════════════════════════════════════════════════════════════
    # 5. LOGO Y VARIANTES
    # ═══════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("5. Logo y Variantes", s_h1))
    story.append(hr())

    story.append(Paragraph("Concepto", s_h2))
    story.append(
        bullet("Estructura: Logotipo tipográfico + isotipo geométrico minimalista")
    )
    story.append(
        bullet(
            "Isotipo: Rectángulo redondeado con esquina cortada (plaza de parking vista desde arriba)"
        )
    )
    story.append(bullet("Color: Foreground (#fafafa dark / #09090b light)"))
    story.append(bullet("Tipografía: Space Mono Bold — tratamiento monocromo"))

    story.append(spacer(10))
    story.append(Paragraph("Variantes", s_h2))

    logo_data = [
        [
            Paragraph("<b>Variante</b>", s_caption),
            Paragraph("<b>Composición</b>", s_caption),
            Paragraph("<b>Uso</b>", s_caption),
            Paragraph("<b>Tamaño mín.</b>", s_caption),
        ],
        [
            Paragraph("Horizontal", s_caption),
            Paragraph("Isotipo + logotipo", s_caption),
            Paragraph("Headers, documentos", s_caption),
            Paragraph("120px ancho", s_caption),
        ],
        [
            Paragraph("Vertical", s_caption),
            Paragraph("Isotipo arriba + texto", s_caption),
            Paragraph("Cuadrados, redes", s_caption),
            Paragraph("80px ancho", s_caption),
        ],
        [
            Paragraph("Solo Isotipo", s_caption),
            Paragraph("Marca simplificada", s_caption),
            Paragraph("Favicon, app icon", s_caption),
            Paragraph("24×24px", s_caption),
        ],
    ]
    logo_t = Table(logo_data, colWidths=[80, 130, 130, 90])
    logo_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
            ]
        )
    )
    story.append(logo_t)

    story.append(spacer(10))
    story.append(Paragraph("Versiones por Tema", s_h3))
    story.append(bullet("Dark: Foreground (#fafafa) sobre fondo oscuro"))
    story.append(bullet("Light: Foreground (#09090b) sobre fondo claro"))
    story.append(bullet("Monocromo oscuro: #09090b sobre cualquier fondo claro"))
    story.append(bullet("Monocromo claro: #fafafa sobre cualquier fondo oscuro"))

    story.append(spacer(10))
    story.append(Paragraph("Área de Seguridad y Tamaños", s_h3))
    story.append(bullet('Espacio mínimo: equivalente a la altura de la letra "N"'))
    story.append(
        bullet(
            "Digital — Web: 100px ancho mín / App: 32px altura mín / Favicon: 32×32px, 16×16px"
        )
    )
    story.append(
        bullet("Impresión — Documentos: 30mm ancho mín / Merchandising: 40mm ancho mín")
    )

    story.append(spacer(10))
    story.append(Paragraph("Usos Prohibidos", s_h3))
    prohibitions = [
        "Deformar, estirar o comprimir",
        "Usar colores fuera de los tokens del sistema",
        "Añadir sombras, gradientes o efectos",
        "Rotar o inclinar",
        "Colocar sobre fondos con contraste insuficiente",
        "Usar versión dark sobre fondos claros o viceversa",
    ]
    for p in prohibitions:
        story.append(bullet(f"<font color='#ef4444'>✕</font>  {p}"))

    # ═══════════════════════════════════════════════════════════════════
    # 6. TONO DE COMUNICACIÓN
    # ═══════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("6. Tono de Comunicación", s_h1))
    story.append(hr())

    story.append(Paragraph("Voz de Marca", s_h2))
    story.append(
        Paragraph(
            "<b>Minimalista y directo</b> — Técnico sin ser intimidante. "
            "Limpio y preciso. Orientado a soluciones.",
            s_body,
        )
    )

    story.append(spacer(8))
    story.append(Paragraph("Principios", s_h3))
    principles = [
        (
            "Claridad absoluta",
            "Mensajes directos, sin adornos. Priorizar comprensión inmediata.",
        ),
        (
            "Minimalismo textual",
            "Cada palabra justifica su presencia. Beneficios sin hipérbole.",
        ),
        (
            "Confianza técnica",
            "Demostrar expertise con datos. Transparencia en capacidades.",
        ),
        (
            "Orientado a la acción",
            "CTAs concisos. Verbos: Automatiza, Controla, Optimiza, Gestiona.",
        ),
    ]
    for title, desc in principles:
        story.append(bullet(f"<b>{title}</b> — {desc}"))

    story.append(spacer(8))
    story.append(Paragraph("Ejemplos", s_h3))
    story.append(Paragraph("<b>✓ Correcto:</b>", s_body))
    story.append(bullet('"Automatiza el check-in con QR. Sin filas, sin errores."'))
    story.append(
        bullet('"Dashboard en tiempo real. Ocupación, ingresos y operaciones."')
    )
    story.append(bullet('"Multi-inquilino nativo. Tus datos, aislados y seguros."'))
    story.append(spacer(4))
    story.append(Paragraph("<b>✕ Incorrecto:</b>", s_body))
    story.append(bullet('"Revoluciona la industria del estacionamiento" (hiperbólico)'))
    story.append(bullet('"La solución definitiva" (promesa absoluta)'))

    story.append(spacer(8))
    story.append(Paragraph("Tono por Canal", s_h3))
    channel_data = [
        [
            Paragraph("<b>Canal</b>", s_caption),
            Paragraph("<b>Tono</b>", s_caption),
            Paragraph("<b>Ejemplo</b>", s_caption),
        ],
        [
            Paragraph("Producto (UI)", s_caption),
            Paragraph("Instructivo, conciso", s_caption),
            Paragraph('"Selecciona una plaza disponible"', s_caption),
        ],
        [
            Paragraph("Marketing", s_caption),
            Paragraph("Convincente, honesto", s_caption),
            Paragraph('"Sin instalación. Solo eficiencia."', s_caption),
        ],
        [
            Paragraph("Documentación", s_caption),
            Paragraph("Técnico, estructurado", s_caption),
            Paragraph('"El endpoint /api/v1/... retorna..."', s_caption),
        ],
    ]
    ch_t = Table(channel_data, colWidths=[90, 120, 220])
    ch_t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, 0), 0.75, Z300),
                ("LINEBELOW", (0, 1), (-1, -1), 0.25, Z200),
            ]
        )
    )
    story.append(ch_t)

    # ═══════════════════════════════════════════════════════════════════
    # BUILD
    # ═══════════════════════════════════════════════════════════════════
    doc.build(story)
    print(f"PDF generado: {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
