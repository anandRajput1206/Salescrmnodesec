import type { DashboardFilters } from '../lib/types'
import { formatPeriodLabel } from '../lib/chartUtils'

interface FilterBarProps {
  filters: DashboardFilters
  periodOptions: string[]
  regionOptions: string[]
  showRegionFilter: boolean
  onChange: (filters: DashboardFilters) => void
}

export function FilterBar({
  filters,
  periodOptions,
  regionOptions,
  showRegionFilter,
  onChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label>
        <span>Time Period</span>
        <select
          value={filters.timePeriod}
          onChange={(event) =>
            onChange({
              ...filters,
              timePeriod: event.target.value as DashboardFilters['timePeriod'],
              periodValue: 'all',
            })
          }
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </label>

      <label>
        <span>
          {filters.timePeriod === 'weekly'
            ? 'Week'
            : filters.timePeriod === 'monthly'
              ? 'Month'
              : 'Quarter'}
        </span>
        <select
          value={filters.periodValue}
          onChange={(event) => onChange({ ...filters, periodValue: event.target.value })}
        >
          <option value="all">All</option>
          {periodOptions.map((option) => (
            <option key={option} value={option}>
              {formatPeriodLabel(option, filters.timePeriod)}
            </option>
          ))}
        </select>
      </label>

      {showRegionFilter ? (
        <label>
          <span>Region</span>
          <select
            value={filters.region}
            onChange={(event) => onChange({ ...filters, region: event.target.value })}
          >
            <option value="all">All regions</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  )
}
