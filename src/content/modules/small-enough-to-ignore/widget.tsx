import { ModuleShell, type WidgetHostProps } from '../../../components/ModuleShell';
import {
  DEGENERATE_THETA,
  SAFE_THETA,
  formatEstimate,
  formatFixed,
  hook,
  hookRho,
  hookTable,
  rExact,
  rho,
  witnessTable,
  type Order,
} from './compute';

/**
 * Stage A scaffold.
 *
 * The compute layer is finished and tested; this renders its output so the
 * module is a real page rather than a directory of functions, and so the
 * repository's module contract holds while the beats are built. Stages B to D
 * replace this with the hook, the commit gates and the truncation-order slider.
 * Until then the module is marked `draft: true` and does not leave dev.
 */

export interface Params {
  theta: number;
  alpha: number;
  order: Order;
  n: number;
}

const initial: Params = {
  theta: SAFE_THETA,
  alpha: 0.01,
  order: 1,
  n: 1_000_000,
};

export const presets: Record<string, Params> = {
  // The denominator's first-order term is absent, not small.
  'leading-term-survives': { ...initial, theta: DEGENERATE_THETA },
  // Keep only O(1) and both series retain nothing at all.
  'kept-terms-do-not-cancel': { ...initial, order: 0 },
  // The hook, as far out as the table goes: the dropped term is still 1/2.
  'dropped-term-is-not-amplified': { ...initial, n: 1_000_000 },
};

export default function SmallEnoughToIgnoreWidget(props: WidgetHostProps) {
  return (
    <ModuleShell {...props} initial={initial} presets={presets}>
      {(params) => {
        const report = rho(params.theta, params.alpha, params.order);
        const hookReport = hookRho(params.n);

        return (
          <>
            <table className="data-table">
              <caption>
                The hook: what {hook.variableLatex} large does to the term you dropped
              </caption>
              <thead>
                <tr>
                  <th scope="col">n</th>
                  <th scope="col">value</th>
                </tr>
              </thead>
              <tbody>
                {hookTable().map(({ n, value }) => (
                  <tr key={n}>
                    <th scope="row">{n.toLocaleString('en-GB')}</th>
                    <td className="numeric">{formatFixed(value, 7)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="data-table">
              <caption>
                R at the two points, exact and truncated at order {params.order}
              </caption>
              <thead>
                <tr>
                  <th scope="col">α</th>
                  <th scope="col">θ = π/3</th>
                  <th scope="col">θ = 0</th>
                </tr>
              </thead>
              <tbody>
                {witnessTable(SAFE_THETA, params.order).map((safe, i) => {
                  const degenerate = witnessTable(DEGENERATE_THETA, params.order)[i];
                  return (
                    <tr key={safe.alpha}>
                      <th scope="row">{safe.alpha}</th>
                      <td className="numeric">{formatEstimate(safe.exact, 5)}</td>
                      <td className="numeric">
                        {degenerate ? formatEstimate(degenerate.exact, 5) : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="widget-readout">
              <div>
                <span className="term">ρ, at this point and order</span>
                <span
                  className={`value ${report.verdict === 'safe' ? 'value-decisive' : 'value-broken'}`}
                >
                  {Number.isFinite(report.binding)
                    ? formatFixed(report.binding, 1)
                    : 'unbounded'}
                </span>
              </div>
              <div>
                <span className="term">truncation here</span>
                <span className="value value-text">{report.verdict}</span>
              </div>
              <div>
                <span className="term">ρ for the hook</span>
                <span className="value value-broken">{formatFixed(hookReport.rho, 1)}</span>
              </div>
              <div>
                <span className="term">R at this θ, exact</span>
                <span className="value">
                  {formatEstimate(rExact(params.theta, params.alpha), 5)}
                </span>
              </div>
            </div>
          </>
        );
      }}
    </ModuleShell>
  );
}
