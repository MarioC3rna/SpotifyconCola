// Gestor del reproductor de música
/**
 * Clase que gestiona la reproducción de música en Spotify mediante Web Playback SDK.
 * Maneja la interfaz de usuario, la comunicación con la API de Spotify y la cola de reproducción.
 */
class MusicPlayerManager {
    /**
     * Inicializa el gestor del reproductor de música.
     * Obtiene el token de acceso y establece los valores iniciales.
     */
    constructor() {
        this.token = this.getAccessToken();
        this.player = null;
        this.currentTrack = null;
        this.initialize();
    }

    /**
     * Extrae el token de acceso de Spotify de la URL.
     * @returns {string|null} Token de acceso o null si no está disponible.
     */
    getAccessToken() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            this.handleError('Se necesita inisiaar sesión en Spotify para poder usar el reproductor');
            return null;
        }
        return token;
    }

    /**
     * Inicializa todos los componentes del reproductor.
     * Carga la lista de canciones, configura los eventos y el SDK de Spotify.
     * @async
     */
    async initialize() {
        try {
            await this.loadSongList();
            this.setupEventListeners();
            this.initializeSpotifySDK();
        } catch (error) {
            this.handleError('No se pudo inicializar el reproductor');
        }
    }

    /**
     * Carga la lista de canciones desde el servidor.
     * @async
     */
    async loadSongList() {
        try {
            const response = await fetch(`/top-songs?token=${this.token}`);
            const data = await response.json();
            this.renderSongList(data.queue);
        } catch (error) {
            this.handleError('No se pudieron cargar las canciones');
        }
    }

    /**
     * Renderiza la lista de canciones en la interfaz de usuario.
     * @param {Array} songs - Lista de canciones a mostrar.
     */
    renderSongList(songs) {
        const playlistElement = document.getElementById('queue');
        playlistElement.innerHTML = '';
        
        songs.forEach(song => {
            const songElement = this.createSongElement(song);
            playlistElement.appendChild(songElement);
        });
    }

    /**
     * Crea un elemento HTML para representar una canción en la lista.
     * @param {Object} song - Objeto que contiene la información de la canción.
     * @returns {HTMLElement} Elemento DOM que representa la canción.
     */
    createSongElement(song) {
        const element = document.createElement('li');
        element.className = 'song-item';
        element.innerHTML = `
            <div class="song-info">
                <span class="song-name">${song.name}</span>
                <span class="artist-name">${song.artist}</span>
            </div>
        `;
        element.dataset.uri = song.uri;
        element.addEventListener('click', () => this.playSong(song.uri));
        return element;
    }

    /**
     * Configura el punto de entrada para inicializar el SDK de Spotify.
     * // El sdk es un script que se carga en el index.html
     */
    initializeSpotifySDK() {
        window.onSpotifyWebPlaybackSDKReady = () => {
            this.setupSpotifyPlayer();
        };
    }

    /**
     * Configura el reproductor de Spotify con los parámetros necesarios.
     */
    setupSpotifyPlayer() {
        this.player = new Spotify.Player({
            name: 'Reproductor Musical Personalizado',
            getOAuthToken: callback => callback(this.token),
            volume: 0.5
        });

        this.setupPlayerListeners();
        this.connectPlayer();
    }

    /**
     * Configura los eventos del reproductor de Spotify.
     */
    setupPlayerListeners() {
        this.player.addListener('ready', ({ device_id }) => {
            this.activateDevice(device_id);
        });

        this.player.addListener('player_state_changed', state => {
            this.updatePlayerState(state);
        });

        this.player.addListener('not_ready', () => {
            this.updatePlaybackStatus('Dispositivo desconectado');
        });
    }

    /**
     * Conecta el reproductor de Spotify.
     * @async
     */
    async connectPlayer() {
        try {
            const connected = await this.player.connect();
            if (!connected) {
                throw new Error('Fallo en la conexión del reproductor');
            }
            this.updatePlaybackStatus('Reproductor conectado');
        } catch (error) {
            this.handleError('Error al conectar con Spotify');
        }
    }

    /**
     * Activa el dispositivo de reproducción en la cuenta de Spotify.
     * @async
     * @param {string} deviceId - ID del dispositivo a activar.
     */
    async activateDevice(deviceId) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false
                })
            });

            if (!response.ok) throw new Error('Error al activar dispositivo');
            this.updatePlaybackStatus('Dispositivo listo');
        } catch (error) {
            this.handleError('Error al configurar el dispositivo');
        }
    }

    /**
     * Configura los eventos de los botones de la interfaz.
     */
    setupEventListeners() {
        const playPauseBtn = document.getElementById('play-pause');
        const nextBtn = document.getElementById('play-next');

        playPauseBtn.addEventListener('click', () => this.togglePlayback());
        nextBtn.addEventListener('click', () => this.playNextTrack());
    }

    /**
     * Alterna entre reproducción y pausa.
     * @async
     */
    async togglePlayback() {
        try {
            await this.player.togglePlay();
            this.updatePlaybackStatus('Reproducción alternada');
        } catch (error) {
            this.handleError('Error al alternar reproducción');
        }
    }

    /**
     * Reproduce la siguiente canción en la cola.
     * @async
     */
    async playNextTrack() {
        try {
            const response = await fetch('/play-next');
            const data = await response.json();

            if (data.song) {
                await this.updateNowPlaying(data.song);
                await this.playSong(data.song.uri);
                this.removeFirstSongFromQueue();
            } else {
                this.updatePlaybackStatus('Lista de reproducción finalizada');
                document.getElementById('play-next').disabled = true;
            }
        } catch (error) {
            this.handleError('Error al reproducir siguiente canción');
        }
    }

    /**
     * Reproduce una canción específica con su URI.
     * @async
     * @param {string} uri - URI de Spotify de la canción a reproducir.
     */
    async playSong(uri) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uris: [uri] })
            });

            if (!response.ok) throw new Error('Error al reproducir canción');
        } catch (error) {
            this.handleError('Error en la reproducción');
        }
    }

    /**
     * Actualiza la información de la canción actual en la interfaz.
     * @param {Object} song - Información de la canción que se está reproduciendo.
     */
    updateNowPlaying(song) {
        const nowPlayingElement = document.getElementById('now-playing');
        nowPlayingElement.innerHTML = `
            <div class="now-playing-info">
                <span class="current-song">${song.name}</span>
                <span class="current-artist">${song.artist}</span>
                <span class="playing-indicator">🎵</span>
            </div>
        `;
    }

    /**
     * Elimina la primera canción de la cola visual.
     */
    removeFirstSongFromQueue() {
        const queueElement = document.getElementById('queue');
        if (queueElement.firstChild) {
            queueElement.removeChild(queueElement.firstChild);
        }
    }

    /**
     * Actualiza el mensaje de estado del reproductor en la interfaz.
     * @param {string} message - Mensaje de estado a mostrar.
     */
    updatePlaybackStatus(message) {
        const statusElement = document.getElementById('player-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * Maneja los errores mostrándolos en consola y en la interfaz.
     * @param {string} message - Mensaje de error.
     */
    handleError(message) {
        console.error(message);
        this.updatePlaybackStatus(`Error: ${message}`);
    }
}

/**
 * Inicializa el reproductor cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayerManager();
});