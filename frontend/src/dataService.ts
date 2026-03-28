export const PLACEHOLDER_VALUE = "X";

export type StateBucket = "high" | "medium" | "low";

export interface GapSeriesPoint {
  year: number;
  applications: number;
  originations: number;
  approvalRate: number | null;
}

export interface LoanTypePoint {
  year: number;
  conventional: number;
  govtBacked: number;
}

export interface RefiPoint {
  year: number;
  refiIndex: number;
}

export interface StatePoint {
  state: string;
  value: string;
  bucket: StateBucket;
}

export interface StateRankPoint {
  state: string;
  value: string;
}

export interface LandingData {
  narrativeArc: string[];
  totalRecords: string;
}

export interface CollapseData {
  approvalShift: {
    baseYear: string;
    basePct: string;
    floorYear: string;
    floorPct: string;
    dropPp: string;
  };
  markers: {
    collapseLabelYear: number | null;
    floorYear: number | null;
  };
  gapSeries: GapSeriesPoint[];
  kpis: {
    applicationsPeak: string;
    originationsFloor: string;
    approvalDrop: string;
  };
  loanTypeSeries: LoanTypePoint[];
}

export interface RecoveryData {
  gapSeries: GapSeriesPoint[];
  milestones: {
    floorYear: string;
    floorYearValue: number | null;
    recoveryStartYear: string;
    recoveryStartYearValue: number | null;
    approval2007: string;
    approval2009: string;
    approval2012: string;
    approval2017: string;
  };
  refiSeries: RefiPoint[];
  refiPeak: {
    year: string;
    deltaFromBaseline: string;
  };
  loanTypeSeries: LoanTypePoint[];
  structuralShift: {
    govtShare2007: string;
    govtShare2017: string;
  };
}

export interface EraData {
  lenderMix: {
    conventional: string;
    govtBacked: string;
    secondMortgages: string;
  };
  borrowerProfile: {
    medianIncome: string;
    approvalRate: string;
    dominantPurpose: string;
    dominantPurposeShare: string;
    receivedLoanType: string;
  };
  geography: {
    states: StatePoint[];
    topStates: StateRankPoint[];
    bottomStates: StateRankPoint[];
  };
}

export interface BehaviorShiftData {
  eras: Record<"2007" | "2017", EraData>;
  comparison: {
    borrower2007: string;
    borrower2017: string;
    lender2007: string;
    lender2017: string;
  };
}

export interface SummaryData {
  crisisCard: {
    gapPeak: string;
    peakYear: string;
    applications: string;
    originations: string;
    sparkline: GapSeriesPoint[];
  };
  structuralShiftCard: {
    share2007: string;
    share2017: string;
  };
  recoveryCard: {
    states: StatePoint[];
    topStates: StateRankPoint[];
    bottomStates: StateRankPoint[];
    summarySentence: string;
  };
  footer: {
    headline: string;
    sourceLabel: string;
  };
}

export interface StoryData {
  landing: LandingData;
  collapse: CollapseData;
  recovery: RecoveryData;
  behaviorShift: BehaviorShiftData;
  summary: SummaryData;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8000";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): Record<string, unknown> | null => (isRecord(value) ? value : null);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const firstDefined = (...values: unknown[]): unknown => values.find((value) => value !== undefined && value !== null);

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (!match) {
      return null;
    }
    const parsed = Number.parseFloat(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : PLACEHOLDER_VALUE;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return PLACEHOLDER_VALUE;
};

const round = (value: number, decimals = 1): number => Number(value.toFixed(decimals));

const toPercentText = (value: unknown): string => {
  if (typeof value === "string" && value.includes("%")) {
    return value;
  }

  const parsed = toNumber(value);
  if (parsed === null) {
    return PLACEHOLDER_VALUE;
  }

  return `${round(parsed, 0)}%`;
};

const toPpText = (value: unknown): string => {
  if (typeof value === "string" && value.includes("pp")) {
    return value;
  }

  const parsed = toNumber(value);
  if (parsed === null) {
    return PLACEHOLDER_VALUE;
  }

  return `${round(parsed, 0)}pp`;
};

const toYearText = (value: unknown): string => {
  const parsed = toNumber(value);
  return parsed === null ? PLACEHOLDER_VALUE : String(Math.round(parsed));
};

const toStateBucket = (value: unknown): StateBucket => {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "low";
};

const gapPoint = (item: unknown): GapSeriesPoint | null => {
  const row = asRecord(item);
  if (!row) {
    return null;
  }

  const year = toNumber(row.year);
  const applications = toNumber(row.applications);
  const originations = toNumber(row.originations);

  if (year === null || applications === null || originations === null) {
    return null;
  }

  const approvalRaw = firstDefined(row.approvalRate, row.approval_rate);
  const approvalRateNumber = toNumber(approvalRaw);

  return {
    year: Math.round(year),
    applications,
    originations,
    approvalRate: approvalRateNumber === null ? null : round(approvalRateNumber, 1),
  };
};

const loanTypePoint = (item: unknown): LoanTypePoint | null => {
  const row = asRecord(item);
  if (!row) {
    return null;
  }

  const year = toNumber(row.year);
  const conventional = toNumber(firstDefined(row.conventional, row.conventional_pct));
  const govtBacked = toNumber(firstDefined(row.govtBacked, row.govt_backed, row.govt_backed_pct));

  if (year === null || conventional === null || govtBacked === null) {
    return null;
  }

  return {
    year: Math.round(year),
    conventional: round(conventional, 1),
    govtBacked: round(govtBacked, 1),
  };
};

const refiPoint = (item: unknown): RefiPoint | null => {
  const row = asRecord(item);
  if (!row) {
    return null;
  }

  const year = toNumber(row.year);
  const refiIndex = toNumber(firstDefined(row.refiIndex, row.refi_index));

  if (year === null || refiIndex === null) {
    return null;
  }

  return {
    year: Math.round(year),
    refiIndex: round(refiIndex, 1),
  };
};

const statePoint = (item: unknown): StatePoint | null => {
  const row = asRecord(item);
  if (!row) {
    return null;
  }

  const state = toText(row.state);
  const value = toText(row.value);
  const bucket = toStateBucket(row.bucket);

  return { state, value, bucket };
};

const stateRankPoint = (item: unknown): StateRankPoint | null => {
  const row = asRecord(item);
  if (!row) {
    return null;
  }

  return {
    state: toText(row.state),
    value: toText(row.value),
  };
};

const mapGapSeries = (value: unknown): GapSeriesPoint[] => asArray(value).map(gapPoint).filter((item): item is GapSeriesPoint => item !== null);

const mapLoanTypeSeries = (value: unknown): LoanTypePoint[] =>
  asArray(value).map(loanTypePoint).filter((item): item is LoanTypePoint => item !== null);

const mapRefiSeries = (value: unknown): RefiPoint[] => asArray(value).map(refiPoint).filter((item): item is RefiPoint => item !== null);

const mapStates = (value: unknown): StatePoint[] => asArray(value).map(statePoint).filter((item): item is StatePoint => item !== null);

const mapStateRanks = (value: unknown): StateRankPoint[] =>
  asArray(value).map(stateRankPoint).filter((item): item is StateRankPoint => item !== null);

const defaultStateRows = (): StateRankPoint[] => [
  { state: PLACEHOLDER_VALUE, value: PLACEHOLDER_VALUE },
  { state: PLACEHOLDER_VALUE, value: PLACEHOLDER_VALUE },
  { state: PLACEHOLDER_VALUE, value: PLACEHOLDER_VALUE },
];

const defaultNarrativeArc = (): string[] => [
  "Collapse",
  "Recovery",
  "Behavior Shift",
  "Summary",
];

const createPlaceholderStoryData = (): StoryData => ({
  landing: {
    narrativeArc: defaultNarrativeArc(),
    totalRecords: PLACEHOLDER_VALUE,
  },
  collapse: {
    approvalShift: {
      baseYear: PLACEHOLDER_VALUE,
      basePct: PLACEHOLDER_VALUE,
      floorYear: PLACEHOLDER_VALUE,
      floorPct: PLACEHOLDER_VALUE,
      dropPp: PLACEHOLDER_VALUE,
    },
    markers: {
      collapseLabelYear: null,
      floorYear: null,
    },
    gapSeries: [],
    kpis: {
      applicationsPeak: PLACEHOLDER_VALUE,
      originationsFloor: PLACEHOLDER_VALUE,
      approvalDrop: PLACEHOLDER_VALUE,
    },
    loanTypeSeries: [],
  },
  recovery: {
    gapSeries: [],
    milestones: {
      floorYear: PLACEHOLDER_VALUE,
      floorYearValue: null,
      recoveryStartYear: PLACEHOLDER_VALUE,
      recoveryStartYearValue: null,
      approval2007: PLACEHOLDER_VALUE,
      approval2009: PLACEHOLDER_VALUE,
      approval2012: PLACEHOLDER_VALUE,
      approval2017: PLACEHOLDER_VALUE,
    },
    refiSeries: [],
    refiPeak: {
      year: PLACEHOLDER_VALUE,
      deltaFromBaseline: PLACEHOLDER_VALUE,
    },
    loanTypeSeries: [],
    structuralShift: {
      govtShare2007: PLACEHOLDER_VALUE,
      govtShare2017: PLACEHOLDER_VALUE,
    },
  },
  behaviorShift: {
    eras: {
      "2007": {
        lenderMix: {
          conventional: PLACEHOLDER_VALUE,
          govtBacked: PLACEHOLDER_VALUE,
          secondMortgages: PLACEHOLDER_VALUE,
        },
        borrowerProfile: {
          medianIncome: PLACEHOLDER_VALUE,
          approvalRate: PLACEHOLDER_VALUE,
          dominantPurpose: PLACEHOLDER_VALUE,
          dominantPurposeShare: PLACEHOLDER_VALUE,
          receivedLoanType: PLACEHOLDER_VALUE,
        },
        geography: {
          states: [],
          topStates: defaultStateRows(),
          bottomStates: defaultStateRows(),
        },
      },
      "2017": {
        lenderMix: {
          conventional: PLACEHOLDER_VALUE,
          govtBacked: PLACEHOLDER_VALUE,
          secondMortgages: PLACEHOLDER_VALUE,
        },
        borrowerProfile: {
          medianIncome: PLACEHOLDER_VALUE,
          approvalRate: PLACEHOLDER_VALUE,
          dominantPurpose: PLACEHOLDER_VALUE,
          dominantPurposeShare: PLACEHOLDER_VALUE,
          receivedLoanType: PLACEHOLDER_VALUE,
        },
        geography: {
          states: [],
          topStates: defaultStateRows(),
          bottomStates: defaultStateRows(),
        },
      },
    },
    comparison: {
      borrower2007: PLACEHOLDER_VALUE,
      borrower2017: PLACEHOLDER_VALUE,
      lender2007: PLACEHOLDER_VALUE,
      lender2017: PLACEHOLDER_VALUE,
    },
  },
  summary: {
    crisisCard: {
      gapPeak: PLACEHOLDER_VALUE,
      peakYear: PLACEHOLDER_VALUE,
      applications: PLACEHOLDER_VALUE,
      originations: PLACEHOLDER_VALUE,
      sparkline: [],
    },
    structuralShiftCard: {
      share2007: PLACEHOLDER_VALUE,
      share2017: PLACEHOLDER_VALUE,
    },
    recoveryCard: {
      states: [],
      topStates: defaultStateRows(),
      bottomStates: defaultStateRows(),
      summarySentence: PLACEHOLDER_VALUE,
    },
    footer: {
      headline: PLACEHOLDER_VALUE,
      sourceLabel: PLACEHOLDER_VALUE,
    },
  },
});

export const EMPTY_STORY_DATA = createPlaceholderStoryData();

const fetchEndpoint = async (path: string): Promise<unknown | null> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const mergeApprovalRates = (primary: GapSeriesPoint[], supplemental: GapSeriesPoint[]): GapSeriesPoint[] => {
  if (primary.length === 0) {
    return supplemental;
  }

  const supplementalMap = new Map(supplemental.map((point) => [point.year, point.approvalRate]));
  return primary.map((point) => ({
    ...point,
    approvalRate: point.approvalRate ?? supplementalMap.get(point.year) ?? null,
  }));
};

const normalizeNarrativeArc = (value: unknown): string[] => {
  const arc = asArray(value)
    .map((step) => {
      if (typeof step === "string") {
        const trimmed = step.trim();
        return trimmed.length > 0 ? trimmed : null;
      }

      const row = asRecord(step);
      if (!row) {
        return null;
      }

      const candidate = firstDefined(row.title, row.label, row.step, row.text);
      const normalized = toText(candidate);
      return normalized === PLACEHOLDER_VALUE ? null : normalized;
    })
    .filter((step): step is string => step !== null)
    .filter((step) => step.toLowerCase() !== "overview");

  return arc.length > 0 ? arc : defaultNarrativeArc();
};

const buildLanding = (landingApi: unknown): LandingData => {
  const fallback = EMPTY_STORY_DATA.landing;
  const landingRecord = asRecord(landingApi);
  const dataset = asRecord(landingRecord?.dataset);

  return {
    narrativeArc: normalizeNarrativeArc(landingRecord?.narrative_arc),
    totalRecords: toText(firstDefined(landingRecord?.total_records, dataset?.total_records, fallback.totalRecords)),
  };
};

const buildCollapse = (collapseApi: unknown, chart1Gap: GapSeriesPoint[], chart2LoanTypes: LoanTypePoint[]): CollapseData => {
  const fallback = EMPTY_STORY_DATA.collapse;
  const collapseRecord = asRecord(collapseApi);
  const approvalShift = asRecord(collapseRecord?.approval_shift);
  const markers = asRecord(collapseRecord?.markers);
  const kpis = asRecord(collapseRecord?.kpis);

  const storyGap = mapGapSeries(collapseRecord?.gap_series).slice(0, 4);
  const chartGap = chart1Gap.slice(0, 4);
  const gapSeries = mergeApprovalRates(chartGap.length > 0 ? chartGap : storyGap, storyGap);

  const storyLoanTypes = mapLoanTypeSeries(collapseRecord?.loan_type_series).slice(0, 4);
  const loanTypeSeries = chart2LoanTypes.length > 0 ? chart2LoanTypes.slice(0, 4) : storyLoanTypes;

  return {
    approvalShift: {
      baseYear: toYearText(firstDefined(approvalShift?.base_year, fallback.approvalShift.baseYear)),
      basePct: toPercentText(firstDefined(approvalShift?.base_pct, fallback.approvalShift.basePct)),
      floorYear: toYearText(firstDefined(approvalShift?.floor_year, fallback.approvalShift.floorYear)),
      floorPct: toPercentText(firstDefined(approvalShift?.floor_pct, fallback.approvalShift.floorPct)),
      dropPp: toPpText(firstDefined(approvalShift?.drop_pp, fallback.approvalShift.dropPp)),
    },
    markers: {
      collapseLabelYear: toNumber(firstDefined(markers?.collapse_label_year, fallback.markers.collapseLabelYear)),
      floorYear: toNumber(firstDefined(markers?.floor_year, fallback.markers.floorYear)),
    },
    gapSeries,
    kpis: {
      applicationsPeak: toText(firstDefined(kpis?.applications_peak_m, fallback.kpis.applicationsPeak)),
      originationsFloor: toText(firstDefined(kpis?.originations_floor_m, fallback.kpis.originationsFloor)),
      approvalDrop: toText(firstDefined(kpis?.approval_drop_pct, fallback.kpis.approvalDrop)),
    },
    loanTypeSeries,
  };
};

const buildRecovery = (
  recoveryApi: unknown,
  chart3Gap: GapSeriesPoint[],
  chart4Refi: RefiPoint[],
  chart5LoanTypes: LoanTypePoint[],
): RecoveryData => {
  const fallback = EMPTY_STORY_DATA.recovery;
  const recoveryRecord = asRecord(recoveryApi);
  const milestones = asRecord(recoveryRecord?.milestones);
  const refiPeakRecord = asRecord(recoveryRecord?.refi_peak);
  const structuralShift = asRecord(recoveryRecord?.structural_shift);

  const storyGap = mapGapSeries(recoveryRecord?.gap_series);
  const gapSeries = mergeApprovalRates(chart3Gap.length > 0 ? chart3Gap : storyGap, storyGap);

  const storyRefi = mapRefiSeries(recoveryRecord?.refi_series);
  const refiSeries = chart4Refi.length > 0 ? chart4Refi : storyRefi;

  const storyLoanTypes = mapLoanTypeSeries(recoveryRecord?.loan_type_series);
  const loanTypeSeries = chart5LoanTypes.length > 0 ? chart5LoanTypes : storyLoanTypes;

  return {
    gapSeries,
    milestones: {
      floorYear: toYearText(firstDefined(milestones?.floor_year, fallback.milestones.floorYear)),
      floorYearValue: toNumber(firstDefined(milestones?.floor_year, fallback.milestones.floorYearValue)),
      recoveryStartYear: toYearText(firstDefined(milestones?.recovery_start_year, fallback.milestones.recoveryStartYear)),
      recoveryStartYearValue: toNumber(firstDefined(milestones?.recovery_start_year, fallback.milestones.recoveryStartYearValue)),
      approval2007: toPercentText(firstDefined(milestones?.approval_2007_pct, fallback.milestones.approval2007)),
      approval2009: toPercentText(firstDefined(milestones?.approval_2009_pct, fallback.milestones.approval2009)),
      approval2012: toPercentText(firstDefined(milestones?.approval_2012_pct, fallback.milestones.approval2012)),
      approval2017: toPercentText(firstDefined(milestones?.approval_2017_pct, fallback.milestones.approval2017)),
    },
    refiSeries,
    refiPeak: {
      year: toYearText(firstDefined(refiPeakRecord?.year, fallback.refiPeak.year)),
      deltaFromBaseline: toText(firstDefined(refiPeakRecord?.delta_from_baseline_pct, fallback.refiPeak.deltaFromBaseline)),
    },
    loanTypeSeries,
    structuralShift: {
      govtShare2007: toPercentText(firstDefined(structuralShift?.govt_share_2007_pct, fallback.structuralShift.govtShare2007)),
      govtShare2017: toPercentText(firstDefined(structuralShift?.govt_share_2017_pct, fallback.structuralShift.govtShare2017)),
    },
  };
};

const buildEra = (eraApi: unknown): EraData => {
  const eraRecord = asRecord(eraApi);
  const lenderMix = asRecord(eraRecord?.lender_mix);
  const borrowerProfile = asRecord(eraRecord?.borrower_profile);
  const geography = asRecord(eraRecord?.geography);

  const states = mapStates(geography?.states);
  const topStates = mapStateRanks(geography?.top_states);
  const bottomStates = mapStateRanks(geography?.bottom_states);

  return {
    lenderMix: {
      conventional: toPercentText(lenderMix?.conventional_pct),
      govtBacked: toPercentText(lenderMix?.govt_backed_pct),
      secondMortgages: toPercentText(lenderMix?.second_mortgage_pct),
    },
    borrowerProfile: {
      medianIncome: toText(borrowerProfile?.median_income_usd),
      approvalRate: toPercentText(borrowerProfile?.approval_rate_pct),
      dominantPurpose: toText(borrowerProfile?.dominant_purpose_label),
      dominantPurposeShare: toPercentText(borrowerProfile?.dominant_purpose_pct),
      receivedLoanType: toText(borrowerProfile?.received_loan_type_label),
    },
    geography: {
      states,
      topStates: topStates.length > 0 ? topStates : defaultStateRows(),
      bottomStates: bottomStates.length > 0 ? bottomStates : defaultStateRows(),
    },
  };
};

const buildBehaviorShift = (behaviorApi: unknown): BehaviorShiftData => {
  const fallback = EMPTY_STORY_DATA.behaviorShift;
  const behaviorRecord = asRecord(behaviorApi);
  const eras = asRecord(behaviorRecord?.eras);
  const comparison = asRecord(behaviorRecord?.comparison);

  return {
    eras: {
      "2007": buildEra(eras?.["2007"]),
      "2017": buildEra(eras?.["2017"]),
    },
    comparison: {
      borrower2007: toText(firstDefined(comparison?.borrower_summary_2007, fallback.comparison.borrower2007)),
      borrower2017: toText(firstDefined(comparison?.borrower_summary_2017, fallback.comparison.borrower2017)),
      lender2007: toText(firstDefined(comparison?.lender_summary_2007, fallback.comparison.lender2007)),
      lender2017: toText(firstDefined(comparison?.lender_summary_2017, fallback.comparison.lender2017)),
    },
  };
};

const buildSummary = (summaryApi: unknown, chart3Gap: GapSeriesPoint[]): SummaryData => {
  const fallback = EMPTY_STORY_DATA.summary;
  const summaryRecord = asRecord(summaryApi);
  const crisisCard = asRecord(summaryRecord?.crisis_card);
  const structuralShiftCard = asRecord(summaryRecord?.structural_shift_card);
  const recoveryCard = asRecord(summaryRecord?.recovery_card);
  const footer = asRecord(summaryRecord?.footer);

  const storySparkline = mapGapSeries(crisisCard?.sparkline);
  const sparkline = chart3Gap.length > 0 ? chart3Gap : storySparkline;

  const states = mapStates(recoveryCard?.states);
  const topStates = mapStateRanks(recoveryCard?.top_states);
  const bottomStates = mapStateRanks(recoveryCard?.bottom_states);

  return {
    crisisCard: {
      gapPeak: toText(firstDefined(crisisCard?.gap_peak_pp, fallback.crisisCard.gapPeak)),
      peakYear: toYearText(firstDefined(crisisCard?.peak_year, fallback.crisisCard.peakYear)),
      applications: toText(firstDefined(crisisCard?.applications_m, fallback.crisisCard.applications)),
      originations: toText(firstDefined(crisisCard?.originations_m, fallback.crisisCard.originations)),
      sparkline,
    },
    structuralShiftCard: {
      share2007: toPercentText(firstDefined(structuralShiftCard?.govt_share_2007_pct, fallback.structuralShiftCard.share2007)),
      share2017: toPercentText(firstDefined(structuralShiftCard?.govt_share_2017_pct, fallback.structuralShiftCard.share2017)),
    },
    recoveryCard: {
      states,
      topStates: topStates.length > 0 ? topStates : fallback.recoveryCard.topStates,
      bottomStates: bottomStates.length > 0 ? bottomStates : fallback.recoveryCard.bottomStates,
      summarySentence: toText(firstDefined(recoveryCard?.summary_sentence, fallback.recoveryCard.summarySentence)),
    },
    footer: {
      headline: toText(firstDefined(footer?.headline, fallback.footer.headline)),
      sourceLabel: toText(firstDefined(footer?.source_label, fallback.footer.sourceLabel)),
    },
  };
};

export const fetchStoryData = async (): Promise<StoryData> => {
  const [
    apiIndexApi,
    landingApi,
    collapseApi,
    recoveryApi,
    behaviorApi,
    summaryApi,
    chart1Api,
    chart2Api,
    chart3Api,
    chart4Api,
    chart5Api,
  ] = await Promise.all([
    fetchEndpoint("/"),
    fetchEndpoint("/story/landing"),
    fetchEndpoint("/story/collapse"),
    fetchEndpoint("/story/recovery"),
    fetchEndpoint("/story/behavior-shift"),
    fetchEndpoint("/story/summary"),
    fetchEndpoint("/chart1"),
    fetchEndpoint("/chart2"),
    fetchEndpoint("/chart3"),
    fetchEndpoint("/chart4"),
    fetchEndpoint("/chart5"),
  ]);

  const apiIndex = asRecord(apiIndexApi);
  const hasExpectedRootPayload =
    toText(apiIndex?.status) !== PLACEHOLDER_VALUE &&
    toText(apiIndex?.version) !== PLACEHOLDER_VALUE &&
    asRecord(apiIndex?.chart_endpoints) !== null &&
    asRecord(apiIndex?.story_endpoints) !== null;

  if (!hasExpectedRootPayload) {
    console.warn("GET / response is missing expected keys: status, version, chart_endpoints, story_endpoints");
  }

  const chart1 = mapGapSeries(chart1Api);
  const chart2 = mapLoanTypeSeries(chart2Api);
  const chart3 = mapGapSeries(chart3Api);
  const chart4 = mapRefiSeries(chart4Api);
  const chart5 = mapLoanTypeSeries(chart5Api);

  return {
    landing: buildLanding(landingApi),
    collapse: buildCollapse(collapseApi, chart1, chart2),
    recovery: buildRecovery(recoveryApi, chart3.length > 0 ? chart3 : chart1, chart4, chart5.length > 0 ? chart5 : chart2),
    behaviorShift: buildBehaviorShift(behaviorApi),
    summary: buildSummary(summaryApi, chart3.length > 0 ? chart3 : chart1),
  };
};
