// Copyright (C) 2026 Front Porch AI
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Web mirror of Desktop Settings → General → 18+ themes.
// Lives in General rather than inside Porch Life because turning it off hides
// Porch Life's After Dark group completely.

import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ExistingChatsOffer } from './ExistingChatsOffer';

export function AdultThemesSettings({
  onAdultThemesChange,
}: {
  onAdultThemesChange?: (enabled: boolean) => void;
}) {
  const [on, setOn] = useState(false);
  const [realismAllowed, setRealismAllowed] = useState(true);
  const [nsfwDefault, setNsfwDefault] = useState(false);
  const [offerAfterglow, setOfferAfterglow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{
        realism?: {
          adultThemesEnabled?: boolean;
          realismAllowed?: boolean;
          nsfwCooldownDefault?: boolean;
        };
      }>('/api/settings')
      .then((r) => {
        if (cancelled) return;
        const adult = r.realism?.adultThemesEnabled === true;
        setOn(adult);
        setRealismAllowed(r.realism?.realismAllowed !== false);
        setNsfwDefault(r.realism?.nsfwCooldownDefault === true);
        onAdultThemesChange?.(adult);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onAdultThemesChange]);

  const commit = (next: boolean) => {
    const prevAllowed = on && nsfwDefault;
    setOn(next);
    onAdultThemesChange?.(next);
    api
      .post('/api/settings', { realism: { adultThemesEnabled: next } })
      .then(() => {
        if (realismAllowed && !prevAllowed && next && nsfwDefault) {
          setOfferAfterglow(true);
        }
      })
      .catch(() => {});
  };

  return (
    <section className="card" data-testid="adult-themes-card">
      {offerAfterglow && (
        <ExistingChatsOffer
          feature="afterglow"
          onClose={() => setOfferAfterglow(false)}
        />
      )}
      <h3>Porch Life</h3>
      <p className="reading-blurb">
        Shows the adult features — the After Dark group in Porch Life, and
        intimate preferences in the character editor. Off means they are simply
        not there. Turning this off never erases what you already set; it only
        hides the switches.
      </p>
      <label className="tool-toggle">
        <span>18+ themes</span>
        <input
          type="checkbox"
          role="switch"
          className="switch"
          checked={on}
          onChange={(e) => commit(e.target.checked)}
          aria-label="18+ themes"
        />
      </label>
    </section>
  );
}
