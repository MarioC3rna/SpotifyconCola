# 🎵 Proyecto: Modificación del Sistema de Reproducción en Spotify

## 📌 Descripción

Este proyecto explora una modificación en la estructura de reproducción de canciones en Spotify, priorizando ciertas canciones sobre otras. En lugar de utilizar un sistema FIFO (First In, First Out) o una reproducción completamente aleatoria, se implementa una **cola de prioridad** que reorganiza las canciones en función de su importancia asignada.
Este programa necesita del ID del cliente y el ID secreto, estos dos ids se colocan en el archivo .env para que funcione correctamente 

## 🚀 Objetivo

El objetivo de esta modificación es mejorar la gestión de la lista de reproducción, permitiendo que ciertas canciones se escuchen antes según su nivel de prioridad. Esto introduce un sistema más dinámico y jerárquico en la selección de canciones.

## 🔍 Características

- 🎯 **Prioridad en las canciones**: Algunas canciones se reproducen antes que otras según su nivel de importancia.
- 📊 **Estructura de datos optimizada**: Implementación de una cola de prioridad en lugar de una simple cola FIFO.
- 🔄 **Reordenamiento automático**: Cada vez que se inserta una nueva canción en la cola, el sistema evalúa su prioridad y reorganiza la lista de reproducción.

## 🛠️ Tecnologías Utilizadas

- **JavaScript** para la lógica de la aplicación.
- **HTML & CSS** para la interfaz de usuario con un diseño basado en los colores de Spotify.

## 🎨 Interfaz de Usuario

Se ha diseñado una interfaz atractiva inspirada en el esquema de colores de Spotify para ofrecer una experiencia visual inmersiva y agradable.

## 📂 Estructura del Proyecto

```
📂 Proyecto
│── 📄 index.html     # Estructura de la página principal
│── 🎨 styles.css     # Estilos basados en la estética de Spotify
│── 📜 script.js      # Lógica de la cola de prioridad
```

## 📌 Notas Adicionales

Este sistema implica que la web estará en constante reordenamiento, evaluando la prioridad de cada canción insertada y ajustando la lista de reproducción en consecuencia.

--prompt--
Ahora eres experto en Front end 
Necesito que me generes un archivo .hmtl y styles .css para para esta app echa en JavaScrip, que sea enterno a los colores de Spotify

📢 **Importante:** Esta implementación no afecta la funcionalidad actual de Spotify, sino que es una exploración teórica y técnica sobre posibles mejoras en su algoritmo de reproducción.


