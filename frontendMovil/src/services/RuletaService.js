const API_BASE_URL = 'https://marquesa.onrender.com/api';

class RuletaService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Crear headers de autenticación híbridos (adaptado del web)
     */
    getAuthHeaders(token) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Manejar respuestas de la API
     */
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Reintentos automáticos para conexiones inestables
     */
    async retryRequest(requestFn, attempts = this.retryAttempts) {
        try {
            return await requestFn();
        } catch (error) {
            if (attempts > 1 && this.shouldRetry(error)) {
                console.log(`🔄 Reintentando petición... Intentos restantes: ${attempts - 1}`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.retryRequest(requestFn, attempts - 1);
            }
            throw error;
        }
    }

    /**
     * Determinar si un error debe ser reintentado
     */
    shouldRetry(error) {
        return error.message.includes('network') || 
               error.message.includes('timeout') ||
               error.message.includes('fetch') ||
               error.name === 'TypeError';
    }

    /**
     * Generar código de descuento en la ruleta
     * Endpoint: POST /api/clients/ruleta/generate
     */
    async generateDiscountCode(token) {
        console.log('🎰 RuletaService: Generando código de descuento...');

        return this.retryRequest(async () => {
            const operationPromise = fetch(`${this.baseURL}/clients/ruleta/generate`, {
                method: 'POST',
                headers: this.getAuthHeaders(token),
                body: JSON.stringify({
                    // Enviar datos vacíos para que el backend use su lógica de selección aleatoria
                })
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await this.handleResponse(response);

            if (data.success) {
                console.log('✅ RuletaService: Código generado exitosamente:', data.code);
                return {
                    success: true,
                    code: data.code,
                    token: data.token || null,
                    message: data.message
                };
            } else {
                throw new Error(data.message || 'Error al generar código');
            }
        });
    }

    /**
     * Obtener códigos de descuento del usuario
     * Endpoint: GET /api/clients/ruleta/codes
     */
    async getUserCodes(token) {
        console.log('📋 RuletaService: Obteniendo códigos del usuario...');

        return this.retryRequest(async () => {
            const operationPromise = fetch(`${this.baseURL}/clients/ruleta/codes`, {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await this.handleResponse(response);

            if (data.success) {
                console.log('✅ RuletaService: Códigos obtenidos:', data.codes?.length || 0);
                return {
                    success: true,
                    codes: data.codes || [],
                    activeCodes: data.activeCodes || 0,
                    maxActiveAllowed: data.maxActiveAllowed || 10,
                    token: data.token || null
                };
            } else {
                throw new Error(data.message || 'Error al obtener códigos');
            }
        });
    }

    /**
     * Verificar si el usuario puede girar la ruleta
     * Endpoint: GET /api/clients/ruleta/codes (reutiliza endpoint)
     */
    async checkCanSpin(token) {
        console.log('🔍 RuletaService: Verificando si puede girar...');

        try {
            const result = await this.getUserCodes(token);
            
            if (result.success) {
                const activeCodes = result.activeCodes || 0;
                const maxActive = result.maxActiveAllowed || 10;

                if (activeCodes >= maxActive) {
                    return {
                        canSpin: false,
                        reason: `Has alcanzado el máximo de códigos activos (${maxActive}). Utiliza tus códigos existentes o espera a que se caduquen.`,
                        activeCodes,
                        maxActive
                    };
                }

                return { 
                    canSpin: true, 
                    activeCodes, 
                    maxActive,
                    token: result.token
                };
            } else {
                return { 
                    canSpin: false, 
                    reason: 'Error al verificar códigos existentes' 
                };
            }

        } catch (error) {
            console.error('❌ RuletaService: Error verificando códigos:', error);
            
            let errorMessage = 'Error de conexión';
            
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
            
            return { canSpin: false, reason: errorMessage };
        }
    }
}

// Instancia singleton del servicio
const ruletaService = new RuletaService();

export default ruletaService;