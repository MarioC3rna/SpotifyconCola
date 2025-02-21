// Gestor del reproductor de música
class MusicPlayerManager {
    constructor() {
        this.token = this.getAccessToken();
        this.player = null;
        this.currentTrack = null;
        this.initialize();
    }

    getAccessToken() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            this.handleError('Se necesita inisiaar sesión en Spotify para poder usar el reproductor');
            return null;
        }
        return token;
    }

    async initialize() {
        try {
            await this.loadSongList();
            this.setupEventListeners();
            this.initializeSpotifySDK();
        } catch (error) {
            this.handleError('No se pudo inicializar el reproductor');
        }
    }

    async loadSongList() {
        try {
            const response = await fetch(`/top-songs?token=${this.token}`);
            const data = await response.json();
            this.renderSongList(data.queue);
        } catch (error) {
            this.handleError('No se pudieron cargar las canciones');
        }
    }

    renderSongList(songs) {
        const playlistElement = document.getElementById('queue');
        playlistElement.innerHTML = '';
        
        songs.forEach(song => {
            const songElement = this.createSongElement(song);
            playlistElement.appendChild(songElement);
        });
    }

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

    initializeSpotifySDK() {
        window.onSpotifyWebPlaybackSDKReady = () => {
            this.setupSpotifyPlayer();
        };
    }

    setupSpotifyPlayer() {
        this.player = new Spotify.Player({
            name: 'Reproductor Musical Personalizado',
            getOAuthToken: callback => callback(this.token),
            volume: 0.5
        });

        this.setupPlayerListeners();
        this.connectPlayer();
    }

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

    setupEventListeners() {
        const playPauseBtn = document.getElementById('play-pause');
        const nextBtn = document.getElementById('play-next');

        playPauseBtn.addEventListener('click', () => this.togglePlayback());
        nextBtn.addEventListener('click', () => this.playNextTrack());
    }

    async togglePlayback() {
        try {
            await this.player.togglePlay();
            this.updatePlaybackStatus('Reproducción alternada');
        } catch (error) {
            this.handleError('Error al alternar reproducción');
        }
    }

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

    removeFirstSongFromQueue() {
        const queueElement = document.getElementById('queue');
        if (queueElement.firstChild) {
            queueElement.removeChild(queueElement.firstChild);
        }
    }

    updatePlaybackStatus(message) {
        const statusElement = document.getElementById('player-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    handleError(message) {
        console.error(message);
        this.updatePlaybackStatus(`Error: ${message}`);
    }
}

// Inicializar el reproductor
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayerManager();
});