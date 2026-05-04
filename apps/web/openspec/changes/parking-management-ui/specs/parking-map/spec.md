## ADDED Requirements

### Requirement: Interactive map component
El sistema SHALL proveer un componente `ParkingMapComponent` standalone que renderice un mapa interactivo usando Leaflet con tiles de OpenStreetMap.

#### Scenario: Renderizado del mapa
- **WHEN** el componente se inicializa
- **THEN** se renderiza un mapa centrado en una ubicación por defecto con tiles de OpenStreetMap

### Requirement: Click-to-place marker
El mapa SHALL permitir al usuario hacer click para colocar un marker que representa la ubicación del parqueadero.

#### Scenario: Colocar marker por click
- **WHEN** el usuario hace click en cualquier punto del mapa
- **THEN** se coloca un marker en esa posición y se emite el evento con las coordenadas (latitude, longitude)

#### Scenario: Mover marker existente
- **WHEN** el usuario hace click en una nueva posición habiendo un marker existente
- **THEN** el marker se mueve a la nueva posición y se emite el evento actualizado

### Requirement: Initial position input
El componente SHALL aceptar una posición inicial via input signal para pre-centrar el mapa y mostrar un marker existente.

#### Scenario: Posición inicial proporcionada
- **WHEN** se pasa `initialPosition` con coordenadas
- **THEN** el mapa centra en esa ubicación y muestra un marker

#### Scenario: Sin posición inicial
- **WHEN** no se pasa `initialPosition`
- **THEN** el mapa centra en una ubicación por defecto (ej: centro de la ciudad principal del país)

### Requirement: Readonly mode
El componente SHALL soportar un modo de solo lectura via input signal donde no se puede interactuar con el mapa.

#### Scenario: Mapa en modo lectura
- **WHEN** se pasa `readonly: true`
- **THEN** el mapa muestra la ubicación pero ignora clicks del usuario

### Requirement: Coordinate output
El componente SHALL emitir las coordenadas seleccionadas via output signal cuando el usuario interactúa con el mapa.

#### Scenario: Emisión de coordenadas
- **WHEN** el usuario selecciona una ubicación en el mapa
- **THEN** se emite `{ latitude: number, longitude: number }` al componente padre

### Requirement: Map container sizing
El mapa SHALL ocupar un tamaño adecuado y responsivo dentro del formulario.

#### Scenario: Tamaño responsivo
- **WHEN** el componente se renderiza
- **THEN** ocupa el ancho completo del contenedor y un alto mínimo de 300px

### Requirement: Leaflet assets configuration
Los assets de Leaflet (CSS, marker icons) SHALL estar correctamente configurados en el build de Angular.

#### Scenario: Iconos de markers visibles
- **WHEN** se renderiza un marker en el mapa
- **THEN** el ícono del marker se muestra correctamente (sin imagen rota)
