#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

// ==========================================
// DEFINICIÓN DE PINES (Para Arduino Uno)
// ==========================================
#define DS18B20_PIN 2         // Pin Digital 2 para el sensor de temperatura (sonda)
#define DHT_PIN 3             // Pin Digital 3 para el sensor DHT11
#define SOIL_MOISTURE_PIN A0  // Pin Analógico A0 para humedad de la tierra
#define PHOTORESISTOR_PIN A1  // Pin Analógico A1 para el nivel de luz

// ==========================================
// CONFIGURACIÓN DE SENSORES
// ==========================================
// Configuración del DHT11
#define DHTTYPE DHT11
DHT dht(DHT_PIN, DHTTYPE);

// Configuración del DS18B20
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

void setup() {
  // Iniciamos la comunicación (debe coincidir con el BAUD_RATE de Python)
  Serial.begin(115200);
  
  // Pausa para dar tiempo a que Python y Arduino se sincronicen
  delay(2000); 
  Serial.println("Starting..."); // El script de Python detecta esto y lo ignora

  // Inicializar los sensores digitales
  dht.begin();
  ds18b20.begin();
}

void loop() {
  // ------------------------------------------------
  // 1. LEER SENSORES ANALÓGICOS (0 a 1023 en Arduino Uno)
  // ------------------------------------------------
  int soilMoisture = analogRead(SOIL_MOISTURE_PIN);
  int lightLevel = analogRead(PHOTORESISTOR_PIN);

  // ------------------------------------------------
  // 2. LEER DHT11 (Aire: Temperatura y Humedad)
  // ------------------------------------------------
  float airHum = dht.readHumidity();
  float airTempC = dht.readTemperature();

  // Protección por si el DHT11 falla en una lectura
  if (isnan(airHum) || isnan(airTempC)) {
    airHum = 0.0;
    airTempC = 0.0;
  }

  // ------------------------------------------------
  // 3. LEER DS18B20 (Sonda: Temperatura de la tierra)
  // ------------------------------------------------
  ds18b20.requestTemperatures(); 
  float probeTempC = ds18b20.getTempCByIndex(0);

  // ------------------------------------------------
  // 4. IMPRIMIR DATOS PARA PYTHON (Formato CSV)
  // Orden exacto: Tierra, Luz, TempAire, HumAire, TempTierra
  // ------------------------------------------------
  Serial.print(soilMoisture);
  Serial.print(",");
  Serial.print(lightLevel);
  Serial.print(",");
  Serial.print(airTempC);
  Serial.print(",");
  Serial.print(airHum);
  Serial.print(",");
  Serial.println(probeTempC); // El último DEBE ser println para el salto de línea

  // Esperar 5 segundos antes de la siguiente medición
  delay(5000); 
}