var ReniecMapper_1;

import { Injectable, inject } from '@angular/core';
import { __decorate } from 'tslib';
import { UbigeoService } from '../../core/servicios/ubigeo.service';
import { normalizarTexto } from '../ui/registro-paciente/registro-paciente.interfaces';

let ReniecMapper = class ReniecMapper {
  static {
    ReniecMapper_1 = ReniecMapper;
  }
  ubigeoService = inject(UbigeoService);
  static CODIGOS_ESTADO_CIVIL = {
    '01': 'SOLTERO',
    '02': 'CASADO',
    '03': 'VIUDO',
    '04': 'DIVORCIADO',
    '05': 'SEPARADO',
    '06': 'CONVIVIENTE',
  };
  async mapearDatos(datos, formExistente, tiposSexo, estadosCivil) {
    const parcial = {};
    const extra = {};
    this.parsearNombres(datos, formExistente, parcial);
    if (datos.fechaNacimiento)
      parcial.fechaNacimiento = String(datos.fechaNacimiento);
    if (datos.nombrePadre)
      parcial.nombrePadre = String(datos.nombrePadre || '').toUpperCase();
    if (datos.nombreMadre)
      parcial.nombreMadre = String(datos.nombreMadre || '').toUpperCase();
    parcial.idTipoSexo = this.mapearSexo(String(datos.sexo), tiposSexo);
    parcial.idEstadoCivil = this.mapearEstadoCivil(
      String(datos.estadoCivil),
      estadosCivil,
    );
    if (datos.direccion) parcial.direccionDomicilio = String(datos.direccion);
    await this.asignarUbigeos(datos, parcial, extra);
    return { form: parcial, ...extra };
  }
  parsearNombres(datos, form, parcial) {
    parcial.apellidoPaterno = String(
      datos.apellidoPaterno || form.apellidoPaterno || '',
    ).toUpperCase();
    parcial.apellidoMaterno = String(
      datos.apellidoMaterno || form.apellidoMaterno || '',
    ).toUpperCase();
    parcial.primerNombre = String(
      datos.primerNombre || form.primerNombre || '',
    ).toUpperCase();
    parcial.segundoNombre = String(
      datos.segundoNombre || form.segundoNombre || '',
    ).toUpperCase();
    if (!parcial.primerNombre && datos.nombres) {
      const partes = String(datos.nombres || '')
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean);
      if (partes.length > 0) parcial.primerNombre = partes[0];
      if (partes.length > 1) parcial.segundoNombre = partes[1];
      if (partes.length > 2) parcial.tercerNombre = partes.slice(2).join(' ');
    }
    if (datos.tercerNombre)
      parcial.tercerNombre = String(datos.tercerNombre || '').toUpperCase();
  }
  async asignarUbigeos(datos, parcial, extra) {
    const d = await this.autocompletarUbigeo(
      datos.departamento,
      datos.provincia,
      datos.distrito,
    );
    if (d.departamento) parcial.idDepartamentoDomicilio = d.departamento;
    if (d.provincia) parcial.idProvinciaDomicilio = d.provincia;
    if (d.distrito) parcial.idDistritoDomicilio = d.distrito;
    const n = await this.autocompletarUbigeo(
      datos.departamentoNacimiento,
      datos.provinciaNacimiento,
      datos.distritoNacimiento,
    );
    if (n.departamento) extra.depNacimientoSel = n.departamento;
    if (n.provincia) extra.provNacimientoSel = n.provincia;
    if (n.distrito) parcial.idDistritoNacimiento = n.distrito;
  }
  async autocompletarUbigeo(departamento, provincia, distrito) {
    const resultado = {};
    if (!departamento && !provincia && !distrito) return resultado;
    const deps = await this.ubigeoService.getDepartamentos();
    const dep = this.ubigeoService.buscarEnCatalogo(deps, departamento);
    if (!dep) return resultado;
    resultado.departamento = String(dep.id);
    const provs = await this.ubigeoService.getProvincias(String(dep.id));
    const prv = this.ubigeoService.buscarEnCatalogo(provs, provincia);
    if (!prv) return resultado;
    resultado.provincia = String(prv.id);
    const dists = await this.ubigeoService.getDistritos(String(prv.id));
    const dis = this.ubigeoService.buscarEnCatalogo(dists, distrito);
    if (dis) resultado.distrito = String(dis.id);
    return resultado;
  }
  mapearSexo(sexoRaw, tiposSexo) {
    const sexo = (sexoRaw || '').trim().toUpperCase();
    if (!sexo) return undefined;
    const esMasculino = sexo.includes('MASC') || sexo === 'M' || sexo === '1';
    const esFemenino = sexo.includes('FEM') || sexo === 'F' || sexo === '2';
    if (!esMasculino && !esFemenino) return undefined;
    const match = tiposSexo.find((sx) => {
      const d = normalizarTexto(sx.descripcion || '');
      return esMasculino
        ? d.includes('MASC') || d === 'M' || d === '1'
        : d.includes('FEM') || d === 'F' || d === '2';
    });
    return match ? String(match.id) : undefined;
  }
  mapearEstadoCivil(estadoRaw, estadosCivil) {
    const estado = normalizarTexto(estadoRaw);
    if (!estado) return undefined;
    if (/^\d+$/.test(estado)) {
      const texto = ReniecMapper_1.CODIGOS_ESTADO_CIVIL[estado];
      if (!texto) return undefined;
      const match = estadosCivil.find(
        (ec) => normalizarTexto(ec.descripcion || '') === texto,
      );
      return match ? String(match.id) : undefined;
    }
    const match = estadosCivil.find((ec) => {
      const d = normalizarTexto(ec.descripcion || '');
      return (
        d.length >= 3 &&
        (estado === d || estado.includes(d) || d.includes(estado))
      );
    });
    return match ? String(match.id) : undefined;
  }
};
ReniecMapper = ReniecMapper_1 = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  ReniecMapper,
);

export { ReniecMapper };
