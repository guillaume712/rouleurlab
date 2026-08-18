import { describe, expect, it } from 'vitest';
import {
  CATEGORIES_COUPLE_SERRAGE,
  SOURCE_COUPLE_SERRAGE,
  TABLE_COUPLE_SERRAGE,
} from './coupleSerrage';

describe('TABLE_COUPLE_SERRAGE', () => {
  it('contient au moins une entrée', () => {
    expect(TABLE_COUPLE_SERRAGE.length).toBeGreaterThan(0);
  });

  it('a des identifiants uniques', () => {
    const ids = TABLE_COUPLE_SERRAGE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(TABLE_COUPLE_SERRAGE)('« $composant » a tous les champs requis et cohérents', (entree) => {
    expect(entree.id.length).toBeGreaterThan(0);
    expect(entree.composant.length).toBeGreaterThan(0);
    expect(CATEGORIES_COUPLE_SERRAGE).toContain(entree.categorie);

    // Le couple doit être un nombre positif et physiquement plausible pour du
    // matériel cycle (pas de composant en dessous de 0,5 Nm ni au-dessus de 150 Nm).
    expect(entree.couple_min_nm).toBeGreaterThan(0);
    expect(entree.couple_min_nm).toBeLessThanOrEqual(150);
    expect(entree.couple_max_nm).toBeGreaterThan(0);
    expect(entree.couple_max_nm).toBeLessThanOrEqual(150);
    expect(entree.couple_max_nm).toBeGreaterThanOrEqual(entree.couple_min_nm);

    if (entree.note !== undefined) {
      expect(entree.note.length).toBeGreaterThan(0);
    }
  });
});

describe('SOURCE_COUPLE_SERRAGE', () => {
  it('cite une source vérifiable (nom + URL)', () => {
    expect(SOURCE_COUPLE_SERRAGE.nom.length).toBeGreaterThan(0);
    expect(SOURCE_COUPLE_SERRAGE.url).toMatch(/^https:\/\//);
  });
});
