import { awardLabel, type StateAward } from './peer-data';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Embeddable award badge for a bank in its state's top ten. Banks that drop
 * out of the lists keep a neutral badge, so an embed never breaks.
 */
export function badgeSvg(award: StateAward | undefined): string {
  const top = award ? `RAVEN BANK RANKINGS · ${award.quarter.toUpperCase()}` : 'RAVEN BANK PEER SNAPSHOT';
  const main = award ? awardLabel(award) : 'Peer data from FDIC call reports';
  const width = Math.max(300, Math.round(main.length * 7.6) + 48);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="64" viewBox="0 0 ${width} 64" role="img" aria-label="${escape(main)}">
<rect width="${width}" height="64" rx="10" fill="#0B0D12"/>
<rect x="0.5" y="0.5" width="${width - 1}" height="63" rx="9.5" fill="none" stroke="#6C8EFF" stroke-opacity="0.5"/>
<text x="24" y="25" font-family="Helvetica,Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5" fill="#6C8EFF">${escape(top)}</text>
<text x="24" y="46" font-family="Helvetica,Arial,sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${escape(main)}</text>
</svg>`;
}
