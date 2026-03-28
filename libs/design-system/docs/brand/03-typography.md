# 3. Sistema tipográfico

## Fuente principal: **Inter**

**Familia**: Sans-serif geométrica  
**Pesos disponibles**: Thin (100) a Black (900), con variable font  
**Licencia**: SIL Open Font License

**Uso:**
- Títulos (H1-H6).
- Cuerpo de texto.
- UI: botones, labels e inputs.
- Navegación.

**Justificación:**
Inter es la fuente estándar de interfaces modernas y del ecosistema shadcn/ui:
- Diseñada específicamente para pantallas, con legibilidad óptima en todos los tamaños.
- Amplia variedad de pesos para una jerarquía tipográfica rica.
- Métricas optimizadas para UI.
- Coherente con la estética minimalista y de alto contraste del sistema Zinc.

## Fuente monoespaciada: **JetBrains Mono**

**Familia**: Monoespaciada para código  
**Pesos disponibles**: Thin (100) a ExtraBold (800)  
**Licencia**: SIL Open Font License

**Uso:**
- Datos numéricos en dashboards.
- Placas vehiculares y códigos.
- Código y datos técnicos.

**Justificación:**
- Ofrece excelente legibilidad entre caracteres similares (`0/O`, `1/l/I`).
- Genera un contraste visual claro frente a Inter para diferenciar datos y texto corrido.

## Fuente del logotipo: **Space Mono Bold**

Space Mono Bold se reserva exclusivamente para el logotipo y la marca tipográfica. No se usa en la UI.

---

## Jerarquía tipográfica

### Para web/app

| Nivel | Fuente | Tamaño | Peso | Line-height | Tracking |
| --- | --- | --- | --- | --- | --- |
| **H1** | Inter | 48px / 3rem | Bold (700) | 56px | -1.2px |
| **H2** | Inter | 36px / 2.25rem | Semibold (600) | 44px | -0.75px |
| **H3** | Inter | 24px / 1.5rem | Semibold (600) | 32px | -0.5px |
| **H4** | Inter | 20px / 1.25rem | Medium (500) | 28px | 0 |
| **Body Large** | Inter | 16px / 1rem | Regular (400) | 26px | 0 |
| **Body Regular** | Inter | 14px / 0.875rem | Regular (400) | 22px | 0 |
| **Caption** | Inter | 12px / 0.75rem | Regular (400) | 18px | 0 |
| **Button Text** | Inter | 14px / 0.875rem | Medium (500) | 20px | 0 |
| **Code / Data** | JetBrains Mono | 13px / 0.8125rem | Regular (400) | 20px | 0 |

*(Code / Data incluye Font-feature-settings: `"tnum"` para tabular numbers)*