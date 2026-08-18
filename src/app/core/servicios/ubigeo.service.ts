import { Injectable, inject } from '@angular/core';
import { MaestrosApiService } from '../../compartido/api/maestros.api.service';
import type { ICatalogoNombre } from '../../compartido/tipos/api-tipos';

@Injectable({
  providedIn: 'root',
})
export class UbigeoService {
  private readonly maestrosApi = inject(MaestrosApiService);

  private cacheDepartamentos: ICatalogoNombre[] | null = null;
  private readonly cacheProvincias = new Map<string, ICatalogoNombre[]>();
  private readonly cacheDistritos = new Map<string, ICatalogoNombre[]>();
  private readonly cacheCentrosPoblados = new Map<string, ICatalogoNombre[]>();

  async getDepartamentos(): Promise<ICatalogoNombre[]> {
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

  async getProvincias(idDepartamento: string): Promise<ICatalogoNombre[]> {
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

  async getDistritos(idProvincia: string): Promise<ICatalogoNombre[]> {
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

  async getCentrosPoblados(idDistrito: string): Promise<ICatalogoNombre[]> {
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

  buscarEnCatalogo(
    lista: ICatalogoNombre[],
    nombre: string,
  ): ICatalogoNombre | undefined {
    const n = this.normalizarTexto(nombre);
    if (!n) return undefined;
    return lista.find((x) => {
      const d = this.normalizarTexto(x.nombre);
      return d === n || (n.length >= 5 && (d.includes(n) || n.includes(d)));
    });
  }

  private normalizarTexto(t: string | undefined | null): string {
    if (!t) return '';
    return t
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }
}
