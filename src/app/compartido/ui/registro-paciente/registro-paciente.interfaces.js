export function formVacio() {
    return {
        idDocIdentidad: '',
        nroDocumento: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        primerNombre: '',
        segundoNombre: '',
        tercerNombre: '',
        fechaNacimiento: '',
        idTipoSexo: '',
        telefono: '',
        celular: '',
        email: '',
        idPaisNacimiento: '',
        idDistritoNacimiento: '',
        idCentroPobladoNacimiento: '',
        idPaisProcedencia: '',
        idDistritoProcedencia: '',
        idCentroPobladoProcedencia: '',
        idPaisDomicilio: '',
        idDepartamentoDomicilio: '',
        idProvinciaDomicilio: '',
        idDistritoDomicilio: '',
        idCentroPobladoDomicilio: '',
        direccionDomicilio: '',
        idEstadoCivil: '',
        idGradoInstruccion: '',
        idTipoOcupacion: '',
        nombrePadre: '',
        nombreMadre: '',
        idEtnia: '',
        idIdioma: '',
        discapacidad: '',
        incapacidad: '',
        idFuenteFinanciamiento: '',
        idEstadollego: '',
        idEsAccidenteTransito: '',
        gestante: '',
        motivo: '',
    };
}
export function normalizarTexto(texto) {
    return texto
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
export function sanitizar(texto) {
    return texto.replace(/[\p{Cc}\u200B-\u200F\uFEFF]/gu, '').trim();
}
export function normalizarNombre(texto) {
    return sanitizar(texto).toUpperCase().replace(/\s+/g, ' ');
}
