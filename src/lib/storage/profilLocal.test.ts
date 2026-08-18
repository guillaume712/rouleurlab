import { beforeEach, describe, expect, it } from 'vitest';
import {
  genererId,
  getProfil,
  getProfilParDefaut,
  getVelo,
  getVeloParDefaut,
  getVelos,
  sauvegarderProfil,
  sauvegarderVelo,
  supprimerVelo,
  validerProfil,
  validerVelo,
} from './profilLocal';

beforeEach(() => {
  window.localStorage.clear();
});

describe('getProfil', () => {
  it('retourne le profil par défaut quand rien n’est sauvegardé', () => {
    const profil = getProfil();
    expect(profil.poids_kg).toBe(70);
    expect(profil.niveau).toBe('intermediaire');
    expect(profil.ftp_w).toBeNull();
  });

  it('retourne le profil par défaut si localStorage contient du JSON invalide', () => {
    window.localStorage.setItem('rouleurlab:profil', '{ ceci nest pas du json');
    const profil = getProfil();
    expect(profil).toEqual(expect.objectContaining(getProfilParDefaut()));
  });

  it('retourne le profil par défaut si les données sont hors plage plausible', () => {
    window.localStorage.setItem(
      'rouleurlab:profil',
      JSON.stringify({ poids_kg: 9999, niveau: 'intermediaire', ftp_w: null, mis_a_jour_le: '2020-01-01' }),
    );
    const profil = getProfil();
    expect(profil.poids_kg).toBe(70);
  });
});

describe('sauvegarderProfil / getProfil', () => {
  it('sauvegarde puis relit le même profil', () => {
    sauvegarderProfil({ poids_kg: 82, niveau: 'confirme', ftp_w: 250, mis_a_jour_le: '' });
    const relu = getProfil();
    expect(relu.poids_kg).toBe(82);
    expect(relu.niveau).toBe('confirme');
    expect(relu.ftp_w).toBe(250);
  });

  it('accepte un ftp_w nul (facultatif)', () => {
    sauvegarderProfil({ poids_kg: 65, niveau: 'debutant', ftp_w: null, mis_a_jour_le: '' });
    const relu = getProfil();
    expect(relu.ftp_w).toBeNull();
  });
});

describe('validerProfil', () => {
  it('rejette un poids hors plage', () => {
    const erreurs = validerProfil({ poids_kg: 5, niveau: 'debutant', ftp_w: null });
    expect(erreurs.poids_kg).toBeDefined();
  });

  it('accepte un profil valide sans erreur', () => {
    const erreurs = validerProfil({ poids_kg: 70, niveau: 'debutant', ftp_w: null });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });
});

describe('garage (getVelos / sauvegarderVelo / supprimerVelo)', () => {
  it('retourne un tableau vide quand rien n’est sauvegardé', () => {
    expect(getVelos()).toEqual([]);
  });

  it('sauvegarde un nouveau vélo puis le relit', () => {
    const velo = getVeloParDefaut();
    sauvegarderVelo(velo);
    const velos = getVelos();
    expect(velos).toHaveLength(1);
    expect(velos[0].id).toBe(velo.id);
    expect(getVelo(velo.id)?.nom).toBe(velo.nom);
  });

  it('met à jour un vélo existant plutôt que d’en créer un second', () => {
    const velo = getVeloParDefaut();
    sauvegarderVelo(velo);
    sauvegarderVelo({ ...velo, nom: 'Vélo renommé' });
    const velos = getVelos();
    expect(velos).toHaveLength(1);
    expect(velos[0].nom).toBe('Vélo renommé');
  });

  it('supprime un vélo par id', () => {
    const velo = getVeloParDefaut();
    sauvegarderVelo(velo);
    supprimerVelo(velo.id);
    expect(getVelos()).toEqual([]);
  });

  it('ignore les vélos corrompus lors de la lecture', () => {
    window.localStorage.setItem('rouleurlab:garage', JSON.stringify([{ nom: 'incomplet' }]));
    expect(getVelos()).toEqual([]);
  });
});

describe('validerVelo', () => {
  it('rejette une cassette incohérente (min >= max)', () => {
    const velo = getVeloParDefaut();
    const erreurs = validerVelo({ ...velo, cassette_dents_min: 30, cassette_dents_max: 28 });
    expect(erreurs.cassette_dents_max).toBeDefined();
  });

  it('accepte un vélo par défaut sans erreur', () => {
    const erreurs = validerVelo(getVeloParDefaut());
    expect(Object.keys(erreurs)).toHaveLength(0);
  });
});

describe('genererId', () => {
  it('génère des identifiants distincts', () => {
    const a = genererId();
    const b = genererId();
    expect(a).not.toBe(b);
  });
});
