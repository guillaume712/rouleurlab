import { describe, expect, it } from 'vitest';
import {
  calculerCompatibiliteCassetteDerailleur,
  validerEntreesCompatibiliteCassetteDerailleur,
  DERAILLEURS,
} from './compatibiliteCassetteDerailleur';

describe('DERAILLEURS — intégrité de la base de données', () => {
  it('contient au moins un dérailleur', () => {
    expect(DERAILLEURS.length).toBeGreaterThan(0);
  });

  it('a des identifiants uniques', () => {
    const ids = DERAILLEURS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(DERAILLEURS)('« $nom » a des specs cohérentes et sourcées', (d) => {
    expect(d.cog_max_dents).toBeGreaterThan(0);
    expect(d.capacite_totale_dents).toBeGreaterThan(0);
    expect(d.source_url).toMatch(/^https:\/\//);
    expect(['fabricant', 'calculee']).toContain(d.origine_capacite);
  });
});

describe('calculerCompatibiliteCassetteDerailleur — Shimano Ultegra RD-R8000-GS (cog max 34, capacité 39)', () => {
  it('cassette 11-32 avec 50/34 : compatible (capacité 37/39, pignon 32/34)', () => {
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 32,
      derailleur_id: 'shimano-ultegra-r8000-gs',
    });
    expect(r.capacite_necessaire_dents).toBe(37);
    expect(r.cog_ok).toBe(true);
    expect(r.capacite_ok).toBe(true);
    expect(r.compatible).toBe(true);
  });

  it('cassette 11-34 avec 50/34 : compatible pile à la limite (capacité 39/39, pignon 34/34)', () => {
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 34,
      derailleur_id: 'shimano-ultegra-r8000-gs',
    });
    expect(r.capacite_necessaire_dents).toBe(39);
    expect(r.compatible).toBe(true);
  });

  it('cassette 11-36 : incompatible, dépasse le pignon max (36 > 34)', () => {
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 36,
      derailleur_id: 'shimano-ultegra-r8000-gs',
    });
    expect(r.cog_ok).toBe(false);
    expect(r.compatible).toBe(false);
  });

  it('cassette 11-36 sur un dérailleur au pignon max suffisant mais capacité dépassée : incompatible par la capacité, pas le pignon', () => {
    // SRAM Force AXS 36T-max : cog_max=36 (donc 36 passe), capacité=39.
    // Écart plateaux 16 + écart cassette 25 = 41 > 39.
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 36,
      derailleur_id: 'sram-force-axs-36',
    });
    expect(r.cog_ok).toBe(true);
    expect(r.capacite_ok).toBe(false);
    expect(r.compatible).toBe(false);
  });
});

describe('calculerCompatibiliteCassetteDerailleur — transmissions mono-plateau (1x)', () => {
  it('GRX RD-RX822-SGS avec plateau 42T et cassette 10-51 : compatible pile à la limite', () => {
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [42],
      cassette_dents_min: 10,
      cassette_dents_max: 51,
      derailleur_id: 'shimano-grx-rx822-sgs',
    });
    expect(r.capacite_necessaire_dents).toBe(41);
    expect(r.compatible).toBe(true);
  });

  it('Eagle AXS avec plateau 32T et cassette 10-52 : compatible pile à la limite', () => {
    const r = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [32],
      cassette_dents_min: 10,
      cassette_dents_max: 52,
      derailleur_id: 'sram-eagle-axs',
    });
    expect(r.capacite_necessaire_dents).toBe(42);
    expect(r.compatible).toBe(true);
  });

  it('ne retient que l’écart plateau max/min, pas le nombre de plateaux', () => {
    const unSeul = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [42],
      cassette_dents_min: 10,
      cassette_dents_max: 45,
      derailleur_id: 'shimano-grx-rx822-sgs',
    });
    const deuxIdentiques = calculerCompatibiliteCassetteDerailleur({
      plateaux_dents: [42, 42],
      cassette_dents_min: 10,
      cassette_dents_max: 45,
      derailleur_id: 'shimano-grx-rx822-sgs',
    });
    expect(unSeul.capacite_necessaire_dents).toBe(deuxIdentiques.capacite_necessaire_dents);
  });
});

describe('validerEntreesCompatibiliteCassetteDerailleur', () => {
  it('accepte des entrées valides', () => {
    const erreurs = validerEntreesCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 32,
      derailleur_id: 'shimano-ultegra-r8000-gs',
    });
    expect(Object.keys(erreurs)).toHaveLength(0);
  });

  it('rejette un identifiant de dérailleur inconnu', () => {
    const erreurs = validerEntreesCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 11,
      cassette_dents_max: 32,
      derailleur_id: 'inexistant',
    });
    expect(erreurs.derailleur_id).toBeDefined();
  });

  it('rejette une cassette incohérente (min >= max)', () => {
    const erreurs = validerEntreesCompatibiliteCassetteDerailleur({
      plateaux_dents: [50, 34],
      cassette_dents_min: 32,
      cassette_dents_max: 30,
      derailleur_id: 'shimano-ultegra-r8000-gs',
    });
    expect(erreurs.cassette_dents_max).toBeDefined();
  });
});
