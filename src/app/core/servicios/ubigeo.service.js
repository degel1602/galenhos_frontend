import { Injectable, inject } from '@angular/core';
import { __decorate } from 'tslib';
import { MaestrosApiService } from '../../compartido/api/maestros.api.service';

let UbigeoService = class UbigeoService {
  maestrosApi = inject(MaestrosApiService);
  cacheDepartamentos = null;
  cacheProvincias = new Map();
  cacheDistritos = new Map();
  cacheCentrosPoblados = new Map();
  async getDepartamentos() {
    if (this.cacheDepartamentos) {
      return this.cacheDepartamentos;
    }
    try {
      const deps = await this.maestrosApi.getDepartamentos();
      this.cacheDepartamentos = Array.isArray(deps) ? deps : [];
      return this.cacheDepartamentos;
    } catch {
      return [];
    }
  }
  async getProvincias(idDepartamento) {
    if (!idDepartamento) return [];
    if (this.cacheProvincias.has(idDepartamento)) {
      return this.cacheProvincias.get(idDepartamento) || [];
    }
    try {
      const provs = await this.maestrosApi.getProvincias(idDepartamento);
      const res = Array.isArray(provs) ? provs : [];
      this.cacheProvincias.set(idDepartamento, res);
      return res;
    } catch {
      return [];
    }
  }
  async getDistritos(idProvincia) {
    if (!idProvincia) return [];
    if (this.cacheDistritos.has(idProvincia)) {
      return this.cacheDistritos.get(idProvincia) || [];
    }
    try {
      const dists = await this.maestrosApi.getDistritos(idProvincia);
      const res = Array.isArray(dists) ? dists : [];
      this.cacheDistritos.set(idProvincia, res);
      return res;
    } catch {
      return [];
    }
  }
  async getCentrosPoblados(idDistrito) {
    if (!idDistrito) return [];
    if (this.cacheCentrosPoblados.has(idDistrito)) {
      return this.cacheCentrosPoblados.get(idDistrito) || [];
    }
    try {
      const cps = await this.maestrosApi.getCentrosPoblados(idDistrito);
      const res = Array.isArray(cps) ? cps : [];
      this.cacheCentrosPoblados.set(idDistrito, res);
      return res;
    } catch {
      return [];
    }
  }
  buscarEnCatalogo(lista, nombre) {
    const n = this.normalizarTexto(nombre);
    if (!n) return undefined;
    return lista.find((x) => {
      const d = this.normalizarTexto(x.nombre);
      return d === n || (n.length >= 5 && (d.includes(n) || n.includes(d)));
    });
  }
  normalizarTexto(t) {
    if (!t) return '';
    return t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }
};
UbigeoService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  UbigeoService,
);

export { UbigeoService };
