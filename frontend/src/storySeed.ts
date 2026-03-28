export interface BackendContract {
  currentValue: string;
  futureEndpoint: string;
  futureField: string;
  notes: string;
}

export interface ContractValue<T> {
  value: T;
  contract: BackendContract;
}

export interface BackendRequirementItem extends BackendContract {
  label: string;
}

type StateBucket = "high" | "medium" | "low";

const summarizeValue = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  return "object";
};

const withContract = <T>(
  value: T,
  futureEndpoint: string,
  futureField: string,
  notes: string,
  currentValue?: string,
): ContractValue<T> => ({
  value,
  contract: {
    currentValue: currentValue ?? summarizeValue(value),
    futureEndpoint,
    futureField,
    notes,
  },
});

const requirement = (label: string, source: ContractValue<unknown>): BackendRequirementItem => ({
  label,
  ...source.contract,
});

export const storySeed = {
  landing: {
    datasetLabel: withContract("HMDA", "/story/landing", "dataset.label", "Dataset badge label."),
    startYear: withContract(2007, "/story/landing", "dataset.start_year", "Dataset start year."),
    endYear: withContract(2017, "/story/landing", "dataset.end_year", "Dataset end year."),
    totalRecords: withContract("170M", "/story/landing", "dataset.total_records", "Historic record count."),
    heroMetricValue: withContract(29, "/story/landing", "hero.metric_value", "Landing hero number."),
    heroMetricUnit: withContract(
      "percentage points",
      "/story/landing",
      "hero.metric_unit",
      "Landing hero unit.",
    ),
    heroDescription: withContract(
      "The drop in approval rates from 2007 to 2009",
      "/story/landing",
      "hero.description",
      "Landing hero description.",
    ),
    chips: [
      {
        label: withContract("applications at the 2007 peak", "/story/landing", "chips[0].label", "Landing chip 1 label."),
        value: withContract("6.8M", "/story/landing", "chips[0].value", "Landing chip 1 value."),
        year: withContract(2007, "/story/landing", "chips[0].year", "Landing chip 1 year."),
      },
      {
        label: withContract("originated in the 2009 floor", "/story/landing", "chips[1].label", "Landing chip 2 label."),
        value: withContract("2.3M", "/story/landing", "chips[1].value", "Landing chip 2 value."),
        year: withContract(2009, "/story/landing", "chips[1].year", "Landing chip 2 year."),
      },
      {
        label: withContract("years until recovery began", "/story/landing", "chips[2].label", "Landing chip 3 label."),
        value: withContract("4", "/story/landing", "chips[2].value", "Landing chip 3 value."),
        year: withContract(2012, "/story/landing", "chips[2].year", "Landing chip 3 anchor year."),
      },
    ],
  },
  collapse: {
    approvalShift: {
      baseYear: withContract(2007, "/story/collapse", "approval_shift.base_year", "Collapse base year."),
      basePct: withContract(84, "/story/collapse", "approval_shift.base_pct", "Collapse base approval rate."),
      floorYear: withContract(2009, "/story/collapse", "approval_shift.floor_year", "Collapse floor year."),
      floorPct: withContract(55, "/story/collapse", "approval_shift.floor_pct", "Collapse floor approval rate."),
      dropPp: withContract(29, "/story/collapse", "approval_shift.drop_pp", "Collapse approval-rate drop in percentage points."),
    },
    markers: {
      collapseLabelYear: withContract(2008, "/story/collapse", "markers.collapse_label_year", "Collapse annotation year."),
      floorYear: withContract(2009, "/story/collapse", "markers.floor_year", "Collapse floor marker year."),
    },
    gapSeries: withContract(
      [
        { year: 2007, applications: 6.8, originations: 5.7, approvalRate: 84 },
        { year: 2008, applications: 5.9, originations: 4.1, approvalRate: 69 },
        { year: 2009, applications: 4.2, originations: 2.3, approvalRate: 55 },
        { year: 2010, applications: 4.5, originations: 2.5, approvalRate: 56 },
      ],
      "/story/collapse",
      "gap_series[]",
      "Beat 1 applications vs originations series for 2007-2010.",
      "4 yearly points",
    ),
    kpis: {
      applicationsPeak: withContract("6.8M", "/story/collapse", "kpis.applications_peak_m", "Collapse KPI applications peak."),
      originationsFloor: withContract("2.3M", "/story/collapse", "kpis.originations_floor_m", "Collapse KPI originations floor."),
      approvalDrop: withContract("29pp", "/story/collapse", "kpis.approval_drop_pct", "Collapse KPI approval drop."),
    },
    loanTypeSeries: withContract(
      [
        { year: 2007, conventional: 88, govtBacked: 12 },
        { year: 2008, conventional: 74, govtBacked: 26 },
        { year: 2009, conventional: 54, govtBacked: 46 },
        { year: 2010, conventional: 58, govtBacked: 42 },
      ],
      "/story/collapse",
      "loan_type_series[]",
      "Beat 2 originated-loan composition for 2007-2010.",
      "4 yearly points",
    ),
  },
  recovery: {
    gapSeries: withContract(
      [
        { year: 2007, applications: 6.8, originations: 5.7 },
        { year: 2008, applications: 5.9, originations: 4.1 },
        { year: 2009, applications: 4.2, originations: 2.3 },
        { year: 2010, applications: 4.5, originations: 2.5 },
        { year: 2011, applications: 4.8, originations: 2.8 },
        { year: 2012, applications: 5.4, originations: 3.5 },
        { year: 2013, applications: 5.1, originations: 3.3 },
        { year: 2014, applications: 5.3, originations: 3.6 },
        { year: 2015, applications: 5.6, originations: 3.9 },
        { year: 2016, applications: 5.8, originations: 4.1 },
        { year: 2017, applications: 6.1, originations: 4.5 },
      ],
      "/story/recovery",
      "gap_series[]",
      "Full-decade gap series for Act Two beat 1.",
      "11 yearly points",
    ),
    milestones: {
      floorYear: withContract(2009, "/story/recovery", "milestones.floor_year", "Recovery floor year."),
      recoveryStartYear: withContract(2012, "/story/recovery", "milestones.recovery_start_year", "Recovery start year."),
      approval2007: withContract(84, "/story/recovery", "milestones.approval_2007_pct", "Recovery milestone approval rate for 2007."),
      approval2009: withContract(55, "/story/recovery", "milestones.approval_2009_pct", "Recovery milestone approval rate for 2009."),
      approval2012: withContract(65, "/story/recovery", "milestones.approval_2012_pct", "Recovery milestone approval rate for 2012."),
      approval2017: withContract(74, "/story/recovery", "milestones.approval_2017_pct", "Recovery milestone approval rate for 2017."),
    },
    refiSeries: withContract(
      [
        { year: 2010, refiIndex: 100 },
        { year: 2011, refiIndex: 87 },
        { year: 2012, refiIndex: 280 },
        { year: 2013, refiIndex: 340 },
        { year: 2014, refiIndex: 160 },
        { year: 2015, refiIndex: 140 },
        { year: 2016, refiIndex: 122 },
        { year: 2017, refiIndex: 110 },
      ],
      "/story/recovery",
      "refi_series[]",
      "Refinancing index for 2010-2017.",
      "8 yearly points",
    ),
    refiPeak: {
      year: withContract(2013, "/story/recovery", "refi_peak.year", "Refi wave peak year."),
      deltaFromBaseline: withContract(
        "+240%",
        "/story/recovery",
        "refi_peak.delta_from_baseline_pct",
        "Refi wave change from 2010 baseline.",
      ),
    },
    loanTypeSeries: withContract(
      [
        { year: 2007, conventional: 88, govtBacked: 12 },
        { year: 2008, conventional: 86, govtBacked: 14 },
        { year: 2009, conventional: 80, govtBacked: 20 },
        { year: 2010, conventional: 76, govtBacked: 24 },
        { year: 2011, conventional: 74, govtBacked: 26 },
        { year: 2012, conventional: 72, govtBacked: 28 },
        { year: 2013, conventional: 70, govtBacked: 30 },
        { year: 2014, conventional: 69, govtBacked: 31 },
        { year: 2015, conventional: 68, govtBacked: 32 },
        { year: 2016, conventional: 67, govtBacked: 33 },
        { year: 2017, conventional: 67, govtBacked: 33 },
      ],
      "/story/recovery",
      "loan_type_series[]",
      "Full-decade loan-type composition for Act Two beat 3.",
      "11 yearly points",
    ),
    structuralShift: {
      govtShare2007: withContract(
        "12%",
        "/story/recovery",
        "structural_shift.govt_share_2007_pct",
        "Pre-crisis government share.",
      ),
      govtShare2017: withContract(
        "33%",
        "/story/recovery",
        "structural_shift.govt_share_2017_pct",
        "Post-recovery government share.",
      ),
    },
  },
  behaviorShift: {
    eras: {
      "2007": {
        lenderMix: {
          conventional: withContract(
            "88%",
            "/story/behavior-shift",
            'eras["2007"].lender_mix.conventional_pct',
            "2007 lender conventional share.",
          ),
          govtBacked: withContract(
            "12%",
            "/story/behavior-shift",
            'eras["2007"].lender_mix.govt_backed_pct',
            "2007 lender government-backed share.",
          ),
          secondMortgages: withContract(
            "9%",
            "/story/behavior-shift",
            'eras["2007"].lender_mix.second_mortgage_pct',
            "2007 second-mortgage share.",
          ),
        },
        borrowerProfile: {
          medianIncome: withContract(
            "$72,000",
            "/story/behavior-shift",
            'eras["2007"].borrower_profile.median_income_usd',
            "2007 median borrower income.",
          ),
          approvalRate: withContract(
            "84%",
            "/story/behavior-shift",
            'eras["2007"].borrower_profile.approval_rate_pct',
            "2007 borrower approval rate.",
          ),
          dominantPurpose: withContract(
            "Home purchase",
            "/story/behavior-shift",
            'eras["2007"].borrower_profile.dominant_purpose_label',
            "2007 dominant borrower purpose label.",
          ),
          dominantPurposeShare: withContract(
            "52%",
            "/story/behavior-shift",
            'eras["2007"].borrower_profile.dominant_purpose_pct',
            "2007 dominant borrower purpose share.",
          ),
          receivedLoanType: withContract(
            "Conventional (private)",
            "/story/behavior-shift",
            'eras["2007"].borrower_profile.received_loan_type_label',
            "2007 typical received loan type.",
          ),
        },
        geography: {
          states: withContract(
            [
              { state: "California", value: "1.2M", bucket: "high" as StateBucket },
              { state: "Florida", value: "850K", bucket: "high" as StateBucket },
              { state: "Texas", value: "780K", bucket: "high" as StateBucket },
              { state: "New York", value: "690K", bucket: "medium" as StateBucket },
              { state: "Illinois", value: "540K", bucket: "medium" as StateBucket },
              { state: "Wyoming", value: "18K", bucket: "low" as StateBucket },
              { state: "North Dakota", value: "22K", bucket: "low" as StateBucket },
              { state: "South Dakota", value: "26K", bucket: "low" as StateBucket },
              { state: "Vermont", value: "31K", bucket: "low" as StateBucket },
              { state: "Alaska", value: "34K", bucket: "low" as StateBucket },
            ],
            "/story/behavior-shift",
            'eras["2007"].geography.states[]',
            "2007 state-level geography payload for the map.",
            "10 highlighted states",
          ),
          topStates: withContract(
            [
              { state: "CA", value: "1.2M", label: "Top lending state by volume" },
              { state: "FL", value: "850K", label: "High pre-crisis origination volume" },
              { state: "TX", value: "780K", label: "Large conventional market" },
            ],
            "/story/behavior-shift",
            'eras["2007"].geography.top_states[]',
            "2007 geography leaderboard leaders.",
            "3 leaderboard rows",
          ),
          bottomStates: withContract(
            [
              { state: "WY", value: "18K", label: "Smallest lending volume" },
              { state: "ND", value: "22K", label: "Smallest lending volume" },
              { state: "SD", value: "26K", label: "Smallest lending volume" },
            ],
            "/story/behavior-shift",
            'eras["2007"].geography.bottom_states[]',
            "2007 geography leaderboard laggards.",
            "3 leaderboard rows",
          ),
        },
      },
      "2017": {
        lenderMix: {
          conventional: withContract(
            "67%",
            "/story/behavior-shift",
            'eras["2017"].lender_mix.conventional_pct',
            "2017 lender conventional share.",
          ),
          govtBacked: withContract(
            "33%",
            "/story/behavior-shift",
            'eras["2017"].lender_mix.govt_backed_pct',
            "2017 lender government-backed share.",
          ),
          secondMortgages: withContract(
            "3%",
            "/story/behavior-shift",
            'eras["2017"].lender_mix.second_mortgage_pct',
            "2017 second-mortgage share.",
          ),
        },
        borrowerProfile: {
          medianIncome: withContract(
            "$91,000",
            "/story/behavior-shift",
            'eras["2017"].borrower_profile.median_income_usd',
            "2017 median borrower income.",
          ),
          approvalRate: withContract(
            "74%",
            "/story/behavior-shift",
            'eras["2017"].borrower_profile.approval_rate_pct',
            "2017 borrower approval rate.",
          ),
          dominantPurpose: withContract(
            "Refinancing",
            "/story/behavior-shift",
            'eras["2017"].borrower_profile.dominant_purpose_label',
            "2017 dominant borrower purpose label.",
          ),
          dominantPurposeShare: withContract(
            "48%",
            "/story/behavior-shift",
            'eras["2017"].borrower_profile.dominant_purpose_pct',
            "2017 dominant borrower purpose share.",
          ),
          receivedLoanType: withContract(
            "Often FHA-backed (government)",
            "/story/behavior-shift",
            'eras["2017"].borrower_profile.received_loan_type_label',
            "2017 typical received loan type.",
          ),
        },
        geography: {
          states: withContract(
            [
              { state: "Texas", value: "1.42", bucket: "high" as StateBucket },
              { state: "Colorado", value: "1.38", bucket: "high" as StateBucket },
              { state: "District of Columbia", value: "1.31", bucket: "high" as StateBucket },
              { state: "North Dakota", value: "1.28", bucket: "high" as StateBucket },
              { state: "Washington", value: "1.19", bucket: "medium" as StateBucket },
              { state: "Nevada", value: "0.52", bucket: "low" as StateBucket },
              { state: "Florida", value: "0.61", bucket: "low" as StateBucket },
              { state: "Arizona", value: "0.64", bucket: "low" as StateBucket },
              { state: "Michigan", value: "0.67", bucket: "low" as StateBucket },
              { state: "Ohio", value: "0.71", bucket: "low" as StateBucket },
            ],
            "/story/behavior-shift",
            'eras["2017"].geography.states[]',
            "2017 state-level geography payload for the map.",
            "10 highlighted states",
          ),
          topStates: withContract(
            [
              { state: "TX", value: "1.42", label: "Fast recovery index" },
              { state: "CO", value: "1.38", label: "Fast recovery index" },
              { state: "DC", value: "1.31", label: "Fast recovery index" },
            ],
            "/story/behavior-shift",
            'eras["2017"].geography.top_states[]',
            "2017 geography leaderboard leaders.",
            "3 leaderboard rows",
          ),
          bottomStates: withContract(
            [
              { state: "NV", value: "0.52", label: "Still below baseline" },
              { state: "FL", value: "0.61", label: "Still below baseline" },
              { state: "AZ", value: "0.64", label: "Still below baseline" },
            ],
            "/story/behavior-shift",
            'eras["2017"].geography.bottom_states[]',
            "2017 geography leaderboard laggards.",
            "3 leaderboard rows",
          ),
        },
      },
    },
    comparison: {
      borrower2007: withContract(
        "The 2007 borrower had less income but easier access.",
        "/story/behavior-shift",
        "comparison.borrower_summary_2007",
        "2007 borrower summary.",
      ),
      borrower2017: withContract(
        "The 2017 borrower earns more but faces tighter standards.",
        "/story/behavior-shift",
        "comparison.borrower_summary_2017",
        "2017 borrower summary.",
      ),
      lender2007: withContract(
        "Taking on risk was the business model.",
        "/story/behavior-shift",
        "comparison.lender_summary_2007",
        "2007 lender summary.",
      ),
      lender2017: withContract(
        "Safety first. Government guarantees preferred.",
        "/story/behavior-shift",
        "comparison.lender_summary_2017",
        "2017 lender summary.",
      ),
    },
  },
  summary: {
    crisisCard: {
      gapPeak: withContract("-29pp", "/story/summary", "crisis_card.gap_peak_pp", "Executive summary crisis headline number."),
      peakYear: withContract(2009, "/story/summary", "crisis_card.peak_year", "Executive summary crisis peak year."),
      applications: withContract("4.2M", "/story/summary", "crisis_card.applications_m", "Executive summary applications stat."),
      originations: withContract("2.3M", "/story/summary", "crisis_card.originations_m", "Executive summary originations stat."),
      sparkline: withContract(
        [
          { year: 2007, applications: 6.8, originations: 5.7 },
          { year: 2008, applications: 5.9, originations: 4.1 },
          { year: 2009, applications: 4.2, originations: 2.3 },
          { year: 2010, applications: 4.5, originations: 2.5 },
          { year: 2011, applications: 4.8, originations: 2.8 },
          { year: 2012, applications: 5.4, originations: 3.5 },
          { year: 2013, applications: 5.1, originations: 3.3 },
          { year: 2014, applications: 5.3, originations: 3.6 },
          { year: 2015, applications: 5.6, originations: 3.9 },
          { year: 2016, applications: 5.8, originations: 4.1 },
          { year: 2017, applications: 6.1, originations: 4.5 },
        ],
        "/story/summary",
        "crisis_card.sparkline[]",
        "Executive summary crisis sparkline series.",
        "11 yearly points",
      ),
    },
    structuralShiftCard: {
      share2007: withContract(
        12,
        "/story/summary",
        "structural_shift_card.govt_share_2007_pct",
        "Executive summary structural shift starting share.",
      ),
      share2017: withContract(
        33,
        "/story/summary",
        "structural_shift_card.govt_share_2017_pct",
        "Executive summary structural shift ending share.",
      ),
    },
    recoveryCard: {
      states: withContract(
        [
          { state: "Texas", bucket: "high" as StateBucket, value: "+42%" },
          { state: "Colorado", bucket: "high" as StateBucket, value: "+38%" },
          { state: "District of Columbia", bucket: "high" as StateBucket, value: "+31%" },
          { state: "Nevada", bucket: "low" as StateBucket, value: "-48%" },
          { state: "Florida", bucket: "low" as StateBucket, value: "-39%" },
          { state: "Arizona", bucket: "low" as StateBucket, value: "-36%" },
        ],
        "/story/summary",
        "recovery_card.states[]",
        "Executive summary recovery map states.",
        "6 highlighted states",
      ),
      topStates: withContract(
        [
          { state: "TX", value: "+42%" },
          { state: "CO", value: "+38%" },
          { state: "DC", value: "+31%" },
        ],
        "/story/summary",
        "recovery_card.top_states[]",
        "Executive summary recovery leaders.",
        "3 leaderboard rows",
      ),
      bottomStates: withContract(
        [
          { state: "NV", value: "-48%" },
          { state: "FL", value: "-39%" },
          { state: "AZ", value: "-36%" },
        ],
        "/story/summary",
        "recovery_card.bottom_states[]",
        "Executive summary recovery laggards.",
        "3 leaderboard rows",
      ),
      summarySentence: withContract(
        "TX, CO, and DC were leading the recovery by 2014 while NV and FL were still below baseline in 2017.",
        "/story/summary",
        "recovery_card.summary_sentence",
        "Executive summary recovery conclusion line.",
      ),
    },
    footer: {
      headline: withContract(
        "The crisis lasted 2 years. The structural change it caused lasted a decade.",
        "/story/summary",
        "footer.headline",
        "Executive summary footer headline.",
      ),
      sourceLabel: withContract(
        "Source: HMDA Historic Data 2007-2017 - Consumer Financial Protection Bureau",
        "/story/summary",
        "footer.source_label",
        "Executive summary footer source label.",
      ),
    },
  },
};

export const backendRequirements = {
  landing: [
    requirement("Hero number", storySeed.landing.heroMetricValue),
    requirement("Hero unit", storySeed.landing.heroMetricUnit),
    requirement("Hero description", storySeed.landing.heroDescription),
    requirement("Dataset label", storySeed.landing.datasetLabel),
    requirement("Dataset start year", storySeed.landing.startYear),
    requirement("Dataset end year", storySeed.landing.endYear),
    requirement("Dataset record count", storySeed.landing.totalRecords),
    {
      label: "Stat chip 1",
      currentValue: `${storySeed.landing.chips[0].value.value} | ${storySeed.landing.chips[0].label.value} | ${storySeed.landing.chips[0].year.value}`,
      futureEndpoint: "/story/landing",
      futureField: "chips[0].value, chips[0].label, chips[0].year",
      notes: "Landing chip 1 payload.",
    },
    {
      label: "Stat chip 2",
      currentValue: `${storySeed.landing.chips[1].value.value} | ${storySeed.landing.chips[1].label.value} | ${storySeed.landing.chips[1].year.value}`,
      futureEndpoint: "/story/landing",
      futureField: "chips[1].value, chips[1].label, chips[1].year",
      notes: "Landing chip 2 payload.",
    },
    {
      label: "Stat chip 3",
      currentValue: `${storySeed.landing.chips[2].value.value} | ${storySeed.landing.chips[2].label.value} | ${storySeed.landing.chips[2].year.value}`,
      futureEndpoint: "/story/landing",
      futureField: "chips[2].value, chips[2].label, chips[2].year",
      notes: "Landing chip 3 payload.",
    },
  ],
  collapse: [
    requirement("Beat 1 base year", storySeed.collapse.approvalShift.baseYear),
    requirement("Beat 1 base approval", storySeed.collapse.approvalShift.basePct),
    requirement("Beat 1 floor year", storySeed.collapse.approvalShift.floorYear),
    requirement("Beat 1 floor approval", storySeed.collapse.approvalShift.floorPct),
    requirement("Gap chart series", storySeed.collapse.gapSeries),
    requirement("Gap chart collapse marker", storySeed.collapse.markers.collapseLabelYear),
    requirement("Gap chart floor marker", storySeed.collapse.markers.floorYear),
    requirement("KPI applications peak", storySeed.collapse.kpis.applicationsPeak),
    requirement("KPI originations floor", storySeed.collapse.kpis.originationsFloor),
    requirement("KPI approval drop", storySeed.collapse.kpis.approvalDrop),
    requirement("Beat 2 loan mix series", storySeed.collapse.loanTypeSeries),
  ],
  recovery: [
    requirement("Beat 1 full-decade gap", storySeed.recovery.gapSeries),
    requirement("Milestone floor year", storySeed.recovery.milestones.floorYear),
    requirement("Milestone recovery start", storySeed.recovery.milestones.recoveryStartYear),
    requirement("Milestone 2007 approval", storySeed.recovery.milestones.approval2007),
    requirement("Milestone 2009 approval", storySeed.recovery.milestones.approval2009),
    requirement("Milestone 2012 approval", storySeed.recovery.milestones.approval2012),
    requirement("Milestone 2017 approval", storySeed.recovery.milestones.approval2017),
    requirement("Refi chart series", storySeed.recovery.refiSeries),
    requirement("Refi peak year", storySeed.recovery.refiPeak.year),
    requirement("Refi peak delta", storySeed.recovery.refiPeak.deltaFromBaseline),
    requirement("Structural shift loan-type series", storySeed.recovery.loanTypeSeries),
    requirement("Structural shift 2007 share", storySeed.recovery.structuralShift.govtShare2007),
    requirement("Structural shift 2017 share", storySeed.recovery.structuralShift.govtShare2017),
  ],
  behaviorShift: [
    requirement("2007 lender mix", storySeed.behaviorShift.eras["2007"].lenderMix.conventional),
    requirement("2007 borrower median income", storySeed.behaviorShift.eras["2007"].borrowerProfile.medianIncome),
    requirement("2007 borrower approval rate", storySeed.behaviorShift.eras["2007"].borrowerProfile.approvalRate),
    requirement("2007 geography states", storySeed.behaviorShift.eras["2007"].geography.states),
    requirement("2007 top states", storySeed.behaviorShift.eras["2007"].geography.topStates),
    requirement("2007 bottom states", storySeed.behaviorShift.eras["2007"].geography.bottomStates),
    requirement("2017 lender mix", storySeed.behaviorShift.eras["2017"].lenderMix.conventional),
    requirement("2017 borrower median income", storySeed.behaviorShift.eras["2017"].borrowerProfile.medianIncome),
    requirement("2017 borrower approval rate", storySeed.behaviorShift.eras["2017"].borrowerProfile.approvalRate),
    requirement("2017 geography states", storySeed.behaviorShift.eras["2017"].geography.states),
    requirement("2017 top states", storySeed.behaviorShift.eras["2017"].geography.topStates),
    requirement("2017 bottom states", storySeed.behaviorShift.eras["2017"].geography.bottomStates),
    requirement("2007 borrower summary", storySeed.behaviorShift.comparison.borrower2007),
    requirement("2017 borrower summary", storySeed.behaviorShift.comparison.borrower2017),
    requirement("2007 lender summary", storySeed.behaviorShift.comparison.lender2007),
    requirement("2017 lender summary", storySeed.behaviorShift.comparison.lender2017),
  ],
  summary: [
    requirement("Crisis sparkline", storySeed.summary.crisisCard.sparkline),
    requirement("Crisis headline number", storySeed.summary.crisisCard.gapPeak),
    requirement("Crisis applications stat", storySeed.summary.crisisCard.applications),
    requirement("Crisis originations stat", storySeed.summary.crisisCard.originations),
    requirement("Structural shift 2007 donut value", storySeed.summary.structuralShiftCard.share2007),
    requirement("Structural shift 2017 donut value", storySeed.summary.structuralShiftCard.share2017),
    requirement("Recovery map states", storySeed.summary.recoveryCard.states),
    requirement("Recovery top states", storySeed.summary.recoveryCard.topStates),
    requirement("Recovery bottom states", storySeed.summary.recoveryCard.bottomStates),
    requirement("Recovery conclusion line", storySeed.summary.recoveryCard.summarySentence),
    requirement("Footer headline", storySeed.summary.footer.headline),
    requirement("Footer source label", storySeed.summary.footer.sourceLabel),
  ],
};
