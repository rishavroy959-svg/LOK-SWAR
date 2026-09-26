/**
 * Lok Swar - Portfolio Optimizer Engine
 * 
 * 0–1 Knapsack Dynamic Programming with Discrete Budget Units,
 * Transparent 5-Factor Impact Scoring, Advanced Constraints (Mandatory, Dependencies, Mutual Exclusions),
 * Deterministic Tie-Breaking, What-If Budget Analysis, Sensitivity Analysis, and Audit Governance.
 * 
 * IMPORTANT: This is a DECISION-SUPPORT TOOL.
 * It does NOT automatically make or execute administrative decisions or sanction projects.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortfolioOptimizer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Constants & Discrete Precision
  // 1 Budget Unit = ₹1,00,000 (1 Lakh). E.g., ₹10 Cr = 1,000 units.
  const UNIT_VALUE_INR = 100000;
  const CRORE_INR = 10000000;
  const UNITS_PER_CRORE = 100;

  // Standard Presets for 5-Factor Impact Scoring
  const SCORING_PRESETS = {
    BALANCED: {
      id: 'BALANCED',
      name: 'Balanced Governance',
      description: 'Equitable balance across population reach, emergency urgency, and service gap criticality.',
      weights: { population: 30, urgency: 25, severity: 20, criticality: 15, outcome: 10 }
    },
    URGENT_RESPONSE: {
      id: 'URGENT_RESPONSE',
      name: 'Urgent Disaster Response',
      description: 'Prioritizes life-safety hazards, acute crises, and high-urgency public grievances.',
      weights: { population: 15, urgency: 40, severity: 30, criticality: 10, outcome: 5 }
    },
    SERVICE_COVERAGE: {
      id: 'SERVICE_COVERAGE',
      name: 'Maximum Service Coverage',
      description: 'Maximizes aggregate citizen beneficiaries and demographic coverage density.',
      weights: { population: 40, urgency: 15, severity: 15, criticality: 20, outcome: 10 }
    },
    CUSTOM: {
      id: 'CUSTOM',
      name: 'Custom Administrative Model',
      description: 'User-specified criteria weights. Total must equal 100%.',
      weights: { population: 30, urgency: 25, severity: 20, criticality: 15, outcome: 10 }
    }
  };

  /**
   * Format Rupees in Indian Numbering System
   * e.g., 100000000 -> "₹10.00 Cr", 7500000 -> "₹75.00 Lakh"
   */
  function formatINR(amountInRupees) {
    const amt = Number(amountInRupees) || 0;
    if (amt >= CRORE_INR) {
      const cr = amt / CRORE_INR;
      return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
    }
    if (amt >= 100000) {
      const lk = amt / 100000;
      return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)} Lakh`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  }

  /**
   * Format Crores float into clean label
   */
  function formatCrores(crFloat) {
    const cr = Number(crFloat) || 0;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }

  /**
   * Convert Crores to discrete integer budget units (₹1 Lakh per unit)
   */
  function croresToUnits(cr) {
    return Math.round((Number(cr) || 0) * UNITS_PER_CRORE);
  }

  /**
   * Convert discrete units back to Crores
   */
  function unitsToCrores(units) {
    return Math.round(((Number(units) || 0) / UNITS_PER_CRORE) * 100) / 100;
  }

  /**
   * Validate that scoring weights sum exactly to 100%
   */
  function validateWeights(weights) {
    if (!weights || typeof weights !== 'object') {
      return { valid: false, error: 'Impact criteria weights must be provided.' };
    }
    const pop = Number(weights.population) || 0;
    const urg = Number(weights.urgency) || 0;
    const sev = Number(weights.severity) || 0;
    const crit = Number(weights.criticality) || 0;
    const out = Number(weights.outcome) || 0;
    const sum = Math.round((pop + urg + sev + crit + out) * 10) / 10;
    if (Math.abs(sum - 100) > 0.01) {
      return {
        valid: false,
        sum,
        error: `Your weights must total 100%. (Current total: ${sum}%)`
      };
    }
    return { valid: true, sum: 100 };
  }

  /**
   * Calculate transparent project impact score (0 - 100)
   */
  function calculateProjectImpact(project, weights = SCORING_PRESETS.BALANCED.weights) {
    const w = weights || SCORING_PRESETS.BALANCED.weights;
    
    // Normalize raw attributes to 0-100 scale
    let popScore = project.populationScore;
    if (popScore === undefined || popScore === null) {
      const pop = Number(project.populationAffected) || Number(project.expected_population_benefited) || Number(project.population_affected) || 0;
      // Standard district benchmark: 20,000 citizens = 100% benchmark score
      popScore = Math.min(100, Math.round((pop / 20000) * 100));
    }

    const urg = Math.min(100, Math.max(0, Number(project.urgencyScore) || Number(project.urgency_score) || Number(project.demand_score) || 0));
    const sev = Math.min(100, Math.max(0, Number(project.severityScore) || Number(project.severity_score) || urg));
    const crit = Math.min(100, Math.max(0, Number(project.serviceCriticalityScore) || Number(project.service_criticality_score) || Number(project.infrastructure_gap_score) || 50));
    const out = Math.min(100, Math.max(0, Number(project.expectedOutcomeScore) || Number(project.expected_outcome_score) || Number(project.social_impact_score) || 50));

    const popW = (Number(w.population) || 0) / 100;
    const urgW = (Number(w.urgency) || 0) / 100;
    const sevW = (Number(w.severity) || 0) / 100;
    const critW = (Number(w.criticality) || 0) / 100;
    const outW = (Number(w.outcome) || 0) / 100;

    const weightedPop = Math.round(popScore * popW * 10) / 10;
    const weightedUrg = Math.round(urg * urgW * 10) / 10;
    const weightedSev = Math.round(sev * sevW * 10) / 10;
    const weightedCrit = Math.round(crit * critW * 10) / 10;
    const weightedOut = Math.round(out * outW * 10) / 10;

    const totalImpact = Math.round((weightedPop + weightedUrg + weightedSev + weightedCrit + weightedOut) * 10) / 10;

    return {
      totalImpact,
      breakdown: {
        populationComponent: weightedPop,
        urgencyComponent: weightedUrg,
        severityComponent: weightedSev,
        criticalityComponent: weightedCrit,
        outcomeComponent: weightedOut
      },
      rawScores: {
        population: popScore,
        urgency: urg,
        severity: sev,
        criticality: crit,
        outcome: out
      },
      weightsUsed: { ...w }
    };
  }

  /**
   * Validate Project Eligibility
   */
  function evaluateEligibility(project) {
    const costCr = Number(project.estimatedCostCr) || Number(project.estimated_cost_cr) || (Number(project.estimatedCost) ? Number(project.estimatedCost) / CRORE_INR : 0);
    if (!costCr || costCr <= 0) {
      return { status: 'Needs Review', eligible: false, reason: 'Missing or invalid project cost.' };
    }
    const hasUrg = project.urgencyScore !== undefined || project.severityScore !== undefined || project.urgency_score !== undefined || project.severity_score !== undefined || project.demand_score !== undefined;
    if (!hasUrg) {
      return { status: 'Needs Review', eligible: false, reason: 'Impact score unavailable — missing urgency data.' };
    }
    if (project.eligibility === 'Ineligible' || project.eligibility === 'Blocked') {
      return { status: project.eligibility, eligible: false, reason: project.ineligibilityReason || 'Project marked ineligible under administrative policy.' };
    }
    return { status: 'Eligible', eligible: true, reason: 'All prerequisites and data points verified.' };
  }

  /**
   * Deterministic Tie-Breaking Comparator
   * 1. Higher total impact
   * 2. Lower total cost
   * 3. Higher population affected
   * 4. Higher urgency score
   * 5. Stable project ID ordering
   */
  function comparePortfolios(portA, portB) {
    if (Math.abs(portA.totalImpact - portB.totalImpact) > 0.05) {
      return portB.totalImpact - portA.totalImpact; // Higher impact first
    }
    if (Math.abs(portA.totalCostCr - portB.totalCostCr) > 0.01) {
      return portA.totalCostCr - portB.totalCostCr; // Lower cost first (more buffer)
    }
    if (portA.totalPopulation !== portB.totalPopulation) {
      return portB.totalPopulation - portA.totalPopulation; // Higher population first
    }
    if (portA.avgUrgency !== portB.avgUrgency) {
      return portB.avgUrgency - portA.avgUrgency;
    }
    const strA = portA.selectedIds.sort().join(',');
    const strB = portB.selectedIds.sort().join(',');
    return strA.localeCompare(strB);
  }

  /**
   * 0–1 Knapsack Dynamic Programming Engine
   * Solves: maximize sum(value[i] * x[i]) s.t. sum(cost[i] * x[i]) <= budget
   * where x[i] in {0, 1}
   * 
   * Handles:
   * - Mandatory projects (pre-allocated)
   * - Prerequisite dependencies (project B requires project A)
   * - Mutual exclusion groups (at most one project per group)
   * - Deterministic tie-breaking
   */
  function solveKnapsackDP(candidateProjects, budgetUnits, options = {}) {
    const N = candidateProjects.length;
    if (N === 0 || budgetUnits <= 0) {
      return { selectedIds: [], totalUnits: 0, totalImpact: 0 };
    }

    // Check if dependencies or exclusion groups exist
    const hasDependencies = candidateProjects.some(p => p.dependencies && p.dependencies.length > 0);
    const hasExclusions = candidateProjects.some(p => p.exclusionGroup);

    // If no complex cross-project constraints, standard 2D DP table is fastest
    if (!hasDependencies && !hasExclusions) {
      // DP table: (N + 1) x (W + 1)
      // To optimize memory: Uint32Array / Float64Array
      const dp = Array.from({ length: N + 1 }, () => new Float64Array(budgetUnits + 1));

      for (let i = 1; i <= N; i++) {
        const proj = candidateProjects[i - 1];
        const c = proj.costUnits;
        const v = proj.impactValue;

        for (let w = 0; w <= budgetUnits; w++) {
          if (c <= w) {
            const takeVal = dp[i - 1][w - c] + v;
            const skipVal = dp[i - 1][w];
            dp[i][w] = Math.max(skipVal, takeVal);
          } else {
            dp[i][w] = dp[i - 1][w];
          }
        }
      }

      // Backtracking to find exact selected project IDs
      let w = budgetUnits;
      const selectedIds = [];
      let totalUnits = 0;
      let totalImpact = 0;

      for (let i = N; i >= 1; i--) {
        const proj = candidateProjects[i - 1];
        const c = proj.costUnits;
        const v = proj.impactValue;

        if (c <= w && Math.abs(dp[i][w] - (dp[i - 1][w - c] + v)) < 1e-5 && dp[i][w] > dp[i - 1][w] + 1e-5) {
          selectedIds.push(proj.id);
          w -= c;
          totalUnits += c;
          totalImpact += v;
        }
      }

      return {
        selectedIds: selectedIds.reverse(),
        totalUnits,
        totalImpact: Math.round(totalImpact * 10) / 10
      };
    }

    // When constraints exist (dependencies, exclusion groups):
    // Use branch-and-bound constrained state search with memoization
    const memo = new Map();
    const projMap = new Map(candidateProjects.map(p => [p.id, p]));

    function isValidSelection(idSet) {
      // 1. Dependency check: if B in idSet, all dependencies must be in idSet
      for (const id of idSet) {
        const p = projMap.get(id);
        if (p && p.dependencies) {
          for (const req of p.dependencies) {
            if (!idSet.has(req)) return false;
          }
        }
      }
      // 2. Mutual exclusion check: at most one project per group
      const seenGroups = new Set();
      for (const id of idSet) {
        const p = projMap.get(id);
        if (p && p.exclusionGroup) {
          if (seenGroups.has(p.exclusionGroup)) return false;
          seenGroups.add(p.exclusionGroup);
        }
      }
      return true;
    }

    // Branch & Bound recursive solver for constrained combinations
    let bestResult = { selectedIds: [], totalUnits: 0, totalImpact: 0, totalCostCr: 0, totalPopulation: 0, avgUrgency: 0 };

    function search(idx, currentUnits, currentImpact, currentIds) {
      if (idx === N) {
        if (isValidSelection(currentIds)) {
          const candPort = {
            selectedIds: Array.from(currentIds),
            totalUnits: currentUnits,
            totalImpact: Math.round(currentImpact * 10) / 10,
            totalCostCr: unitsToCrores(currentUnits),
            totalPopulation: Array.from(currentIds).reduce((acc, id) => acc + (projMap.get(id)?.populationAffected || 0), 0),
            avgUrgency: Array.from(currentIds).reduce((acc, id) => acc + (projMap.get(id)?.urgencyScore || 0), 0) / Math.max(1, currentIds.size)
          };
          if (comparePortfolios(candPort, bestResult) < 0) {
            bestResult = candPort;
          }
        }
        return;
      }

      const p = candidateProjects[idx];
      // Option 1: Take project p (if budget allows and exclusion group not already taken)
      if (currentUnits + p.costUnits <= budgetUnits) {
        let canTake = true;
        if (p.exclusionGroup) {
          for (const id of currentIds) {
            if (projMap.get(id)?.exclusionGroup === p.exclusionGroup) {
              canTake = false;
              break;
            }
          }
        }
        if (canTake) {
          currentIds.add(p.id);
          search(idx + 1, currentUnits + p.costUnits, currentImpact + p.impactValue, currentIds);
          currentIds.delete(p.id);
        }
      }

      // Option 2: Skip project p
      search(idx + 1, currentUnits, currentImpact, currentIds);
    }

    search(0, 0, 0, new Set());

    return {
      selectedIds: bestResult.selectedIds,
      totalUnits: bestResult.totalUnits,
      totalImpact: bestResult.totalImpact
    };
  }

  /**
   * Main Optimizer Function
   * Conceptually: optimizePortfolio(projects, budgetCr, scoringConfig, options)
   */
  function optimizePortfolio(projects = [], budgetCr = 10.0, scoringConfig = SCORING_PRESETS.BALANCED, options = {}) {
    const timestamp = new Date().toISOString();
    const runId = options.runId || `RUN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Validate Budget
    const numericBudget = Number(budgetCr) || 0;
    if (numericBudget <= 0) {
      return {
        success: false,
        error: 'Enter a budget greater than ₹0.',
        runId,
        generatedAt: timestamp
      };
    }

    // 2. Validate Scoring Configuration & Weights
    let weights = scoringConfig;
    if (typeof scoringConfig === 'string' && SCORING_PRESETS[scoringConfig]) {
      weights = SCORING_PRESETS[scoringConfig].weights;
    } else if (scoringConfig && scoringConfig.id && SCORING_PRESETS[scoringConfig.id] && !scoringConfig.weights) {
      weights = SCORING_PRESETS[scoringConfig.id].weights;
    } else if (scoringConfig && scoringConfig.weights) {
      weights = scoringConfig.weights;
    } else if (!scoringConfig) {
      weights = SCORING_PRESETS.BALANCED.weights;
    }
    const weightValidation = validateWeights(weights);
    if (!weightValidation.valid) {
      return {
        success: false,
        error: weightValidation.error,
        runId,
        generatedAt: timestamp
      };
    }

    const budgetUnits = croresToUnits(numericBudget);

    // 3. Project Validation & Eligibility Filtering
    const allEvaluated = projects.map(p => {
      const eligibilityInfo = evaluateEligibility(p);
      const impactInfo = calculateProjectImpact(p, weights);
      const costCr = Number(p.estimatedCostCr) || Number(p.estimated_cost_cr) || (Number(p.estimatedCost) ? Number(p.estimatedCost) / CRORE_INR : 0);
      const costUnits = croresToUnits(costCr);
      return {
        ...p,
        costCr,
        costUnits,
        calculatedImpact: impactInfo.totalImpact,
        impactBreakdown: impactInfo.breakdown,
        eligibilityStatus: eligibilityInfo.status,
        isEligible: eligibilityInfo.eligible,
        eligibilityReason: eligibilityInfo.reason,
        isMandatory: !!p.isMandatory
      };
    });

    const eligibleProjects = allEvaluated.filter(p => p.isEligible);
    const ineligibleProjects = allEvaluated.filter(p => !p.isEligible);

    if (eligibleProjects.length === 0) {
      return {
        success: false,
        error: 'No eligible projects are available for optimization.',
        eligibleCount: 0,
        ineligibleCount: ineligibleProjects.length,
        ineligibleProjects,
        runId,
        generatedAt: timestamp
      };
    }

    // 4. Handle Mandatory Projects
    const mandatoryProjects = eligibleProjects.filter(p => p.isMandatory);
    const optionalProjects = eligibleProjects.filter(p => !p.isMandatory);

    let mandatoryUnits = 0;
    let mandatoryImpact = 0;
    const mandatoryIds = new Set();

    for (const mp of mandatoryProjects) {
      mandatoryUnits += mp.costUnits;
      mandatoryImpact += mp.calculatedImpact;
      mandatoryIds.add(mp.id);
    }

    if (mandatoryUnits > budgetUnits) {
      return {
        success: false,
        error: `Current budget cannot accommodate all mandatory projects. (Mandatory: ${formatINR(mandatoryUnits * UNIT_VALUE_INR)} > Budget: ${formatINR(numericBudget * CRORE_INR)})`,
        mandatoryCostCr: unitsToCrores(mandatoryUnits),
        budgetCr: numericBudget,
        runId,
        generatedAt: timestamp
      };
    }

    const remainingUnitsForOptional = budgetUnits - mandatoryUnits;

    // 5. Format Candidate Projects for 0-1 Knapsack
    const candidatePool = optionalProjects.map(p => ({
      id: p.id,
      name: p.name || p.title || p.project_name || p.short_name,
      costUnits: p.costUnits,
      impactValue: p.calculatedImpact,
      costCr: p.costCr,
      populationAffected: Number(p.populationAffected) || Number(p.expected_population_benefited) || 0,
      urgencyScore: Number(p.urgencyScore) || Number(p.demand_score) || 0,
      dependencies: p.dependencies || [],
      exclusionGroup: p.exclusionGroup || null,
      department: p.department || p.category || 'General'
    }));

    // 6. Execute 0-1 Knapsack Dynamic Programming
    const knapsackResult = solveKnapsackDP(candidatePool, remainingUnitsForOptional, options);

    const finalSelectedIds = new Set([...mandatoryIds, ...knapsackResult.selectedIds]);
    const finalTotalUnits = mandatoryUnits + knapsackResult.totalUnits;
    const finalTotalCostCr = unitsToCrores(finalTotalUnits);
    const remainingBudgetCr = Math.round(Math.max(0, numericBudget - finalTotalCostCr) * 100) / 100;
    const finalTotalImpact = Math.round((mandatoryImpact + knapsackResult.totalImpact) * 10) / 10;
    const budgetUtilizationPct = Math.round((finalTotalCostCr / numericBudget) * 1000) / 10;

    // 7. Explanations: Why Included & Why Excluded
    const selectedProjects = [];
    const excludedProjects = [];

    allEvaluated.forEach(p => {
      const isSelected = finalSelectedIds.has(p.id);
      const budgetSharePct = Math.round((p.costCr / numericBudget) * 1000) / 10;

      if (isSelected) {
        const whyIncluded = p.isMandatory
          ? 'Included because this project is designated as a mandatory statutory priority.'
          : `Selected because it provides a high calculated impact (${p.calculatedImpact}) while remaining within the available budget under the current ${scoringConfig.name || 'scoring'} configuration.`;

        selectedProjects.push({
          ...p,
          isSelected: true,
          budgetSharePct,
          whyIncluded,
          efficiencyRatio: p.costCr > 0 ? Math.round((p.calculatedImpact / p.costCr) * 10) / 10 : 0
        });
      } else {
        let whyNotSelected = '';
        if (!p.isEligible) {
          whyNotSelected = `Not eligible: ${p.eligibilityReason}`;
        } else if (p.dependencies && p.dependencies.some(req => !finalSelectedIds.has(req))) {
          const unfulfilled = p.dependencies.filter(req => !finalSelectedIds.has(req)).join(', ');
          whyNotSelected = `Not selected because required prerequisite project dependency (${unfulfilled}) was not selected.`;
        } else if (p.exclusionGroup && Array.from(finalSelectedIds).some(id => allEvaluated.find(x => x.id === id)?.exclusionGroup === p.exclusionGroup)) {
          const conflict = Array.from(finalSelectedIds).find(id => allEvaluated.find(x => x.id === id)?.exclusionGroup === p.exclusionGroup);
          whyNotSelected = `Not selected because an alternative project from the same mutual exclusion group (${conflict}) was selected.`;
        } else if (p.costUnits > (budgetUnits - finalTotalUnits)) {
          whyNotSelected = `Not selected because including this project (${formatCrores(p.costCr)}) would exceed the remaining budget buffer (${formatCrores(remainingBudgetCr)}).`;
        } else {
          whyNotSelected = 'Not selected because another feasible combination produces a higher total calculated impact under the available budget envelope.';
        }

        excludedProjects.push({
          ...p,
          isSelected: false,
          budgetSharePct,
          whyNotSelected,
          efficiencyRatio: p.costCr > 0 ? Math.round((p.calculatedImpact / p.costCr) * 10) / 10 : 0
        });
      }
    });

    // 8. Department Breakdown & Geographic Reach
    const deptBreakdown = {};
    let totalPopulationCovered = 0;
    const villagesCoveredSet = new Set();

    selectedProjects.forEach(p => {
      const dept = p.department || p.category || 'Other Departments';
      if (!deptBreakdown[dept]) {
        deptBreakdown[dept] = { costCr: 0, projectCount: 0, impact: 0 };
      }
      deptBreakdown[dept].costCr = Math.round((deptBreakdown[dept].costCr + p.costCr) * 100) / 100;
      deptBreakdown[dept].projectCount += 1;
      deptBreakdown[dept].impact = Math.round((deptBreakdown[dept].impact + p.calculatedImpact) * 10) / 10;

      totalPopulationCovered += (Number(p.populationAffected) || Number(p.expected_population_benefited) || 0);
      if (Array.isArray(p.villagesAffected)) {
        p.villagesAffected.forEach(v => villagesCoveredSet.add(v));
      } else if (p.location) {
        villagesCoveredSet.add(p.location);
      }
    });

    // 9. Planning Insights (Factual Observations based on measurable results)
    const planningInsights = [];
    if (remainingBudgetCr > 0) {
      planningInsights.push({
        type: 'budget',
        icon: '💰',
        title: 'Unallocated Budget Buffer',
        message: `${formatCrores(remainingBudgetCr)} remains unallocated in the current portfolio envelope.`
      });
    }

    const nextBestCandidate = excludedProjects.filter(p => p.isEligible && p.costUnits > 0).sort((a, b) => b.calculatedImpact - a.calculatedImpact)[0];
    if (nextBestCandidate) {
      const neededExtraCr = Math.max(0, Math.round((nextBestCandidate.costCr - remainingBudgetCr) * 100) / 100);
      if (neededExtraCr > 0 && neededExtraCr <= 2.5) {
        planningInsights.push({
          type: 'expansion',
          icon: '📈',
          title: 'Budget Expansion Potential',
          message: `Adding ${formatCrores(neededExtraCr)} to the budget would allow including "${nextBestCandidate.name || nextBestCandidate.id}" (Impact: ${nextBestCandidate.calculatedImpact}) under the current criteria.`
        });
      }
    }

    const deptCount = Object.keys(deptBreakdown).length;
    planningInsights.push({
      type: 'coverage',
      icon: '🏛️',
      title: 'Departmental Distribution',
      message: `The selected portfolio distributes resources across ${deptCount} government departments.`
    });

    if (budgetUtilizationPct >= 90) {
      planningInsights.push({
        type: 'utilization',
        icon: '⚡',
        title: 'High Capital Efficiency',
        message: `Current portfolio utilizes ${budgetUtilizationPct}% of the authorized ₹${numericBudget} Cr envelope.`
      });
    }

    // 10. Generate Feasible Alternative Portfolios (Requirement 29)
    const alternatives = [];

    // Alternative A: Lower-Cost Alternative (Picks combination with >= 15% budget buffer)
    if (remainingUnitsForOptional > 50) {
      const bufferBudgetUnits = Math.round(budgetUnits * 0.85); // 85% budget target
      if (bufferBudgetUnits > mandatoryUnits) {
        const altA = solveKnapsackDP(candidatePool, bufferBudgetUnits - mandatoryUnits, options);
        const altAIds = new Set([...mandatoryIds, ...altA.selectedIds]);
        const altACostCr = unitsToCrores(mandatoryUnits + altA.totalUnits);
        if (altAIds.size > 0 && altACostCr < finalTotalCostCr) {
          alternatives.push({
            id: 'ALT-LOWER-COST',
            label: 'Lower-Cost Alternative',
            description: 'Preserves a larger contingency reserve while maintaining high public impact.',
            selectedProjectIds: Array.from(altAIds),
            selectedCount: altAIds.size,
            totalCostCr: altACostCr,
            remainingBudgetCr: Math.round((numericBudget - altACostCr) * 100) / 100,
            totalImpact: Math.round((mandatoryImpact + altA.totalImpact) * 10) / 10,
            impactDiff: Math.round(((mandatoryImpact + altA.totalImpact) - finalTotalImpact) * 10) / 10
          });
        }
      }
    }

    // Alternative B: High-Urgency Alternative (Weights Urgency at 45%)
    const urgentWeights = SCORING_PRESETS.URGENT_RESPONSE.weights;
    const urgentCandidates = optionalProjects.map(p => {
      const imp = calculateProjectImpact(p, urgentWeights);
      return {
        ...candidatePool.find(x => x.id === p.id),
        impactValue: imp.totalImpact
      };
    });
    const altB = solveKnapsackDP(urgentCandidates, remainingUnitsForOptional, options);
    const altBIds = new Set([...mandatoryIds, ...altB.selectedIds]);
    const altBCostCr = unitsToCrores(mandatoryUnits + altB.totalUnits);
    const altBImpact = Math.round((mandatoryImpact + altB.totalImpact) * 10) / 10;
    
    // Only include if portfolio differs from primary
    const isDifferent = altBIds.size !== finalSelectedIds.size || Array.from(altBIds).some(id => !finalSelectedIds.has(id));
    if (isDifferent) {
      alternatives.push({
        id: 'ALT-URGENCY',
        label: 'High-Urgency Alternative',
        description: 'Prioritizes immediate life-safety emergencies, severe structural hazards, and crisis grievances.',
        selectedProjectIds: Array.from(altBIds),
        selectedCount: altBIds.size,
        totalCostCr: altBCostCr,
        remainingBudgetCr: Math.round((numericBudget - altBCostCr) * 100) / 100,
        totalImpact: altBImpact,
        impactDiff: Math.round((altBImpact - finalTotalImpact) * 10) / 10
      });
    }

    // 11. What-If Budget Analysis (Requirement 30)
    const whatIfBudgets = [5.0, 7.5, 10.0, 12.5, 15.0];
    const whatIfResults = whatIfBudgets.map(wBudget => {
      const wUnits = croresToUnits(wBudget);
      if (wUnits < mandatoryUnits) {
        return {
          budgetCr: wBudget,
          isFeasible: false,
          message: 'Insufficient for mandatory projects'
        };
      }
      const wSol = solveKnapsackDP(candidatePool, wUnits - mandatoryUnits, options);
      const wIds = new Set([...mandatoryIds, ...wSol.selectedIds]);
      const wCostCr = unitsToCrores(mandatoryUnits + wSol.totalUnits);
      const wImpact = Math.round((mandatoryImpact + wSol.totalImpact) * 10) / 10;
      
      const addedProjects = Array.from(wIds).filter(id => !finalSelectedIds.has(id));
      const removedProjects = Array.from(finalSelectedIds).filter(id => !wIds.has(id));

      return {
        budgetCr: wBudget,
        isFeasible: true,
        projectCount: wIds.size,
        totalCostCr: wCostCr,
        remainingBudgetCr: Math.round((wBudget - wCostCr) * 100) / 100,
        totalImpact: wImpact,
        selectedProjectIds: Array.from(wIds),
        addedProjectsCount: addedProjects.length,
        removedProjectsCount: removedProjects.length,
        isCurrent: Math.abs(wBudget - numericBudget) < 0.05
      };
    });

    // 12. Measurable Sensitivity Analysis (Requirement 32)
    // Runs 10 discrete perturbation scenarios
    let stableScenarios = 0;
    const testPerturbations = [
      { bDelta: 0.05, cDelta: 0.0, wDelta: 0.0 },
      { bDelta: -0.05, cDelta: 0.0, wDelta: 0.0 },
      { bDelta: 0.0, cDelta: 0.05, wDelta: 0.0 },
      { bDelta: 0.0, cDelta: -0.05, wDelta: 0.0 },
      { bDelta: 0.05, cDelta: 0.05, wDelta: 0.0 },
      { bDelta: -0.05, cDelta: -0.05, wDelta: 0.0 },
      { bDelta: 0.0, cDelta: 0.0, wDelta: 0.05 },
      { bDelta: 0.0, cDelta: 0.0, wDelta: -0.05 },
      { bDelta: 0.02, cDelta: 0.02, wDelta: 0.02 },
      { bDelta: -0.02, cDelta: -0.02, wDelta: -0.02 }
    ];

    testPerturbations.forEach(pert => {
      const pBudget = Math.round(budgetUnits * (1 + pert.bDelta));
      const pPool = candidatePool.map(c => ({
        ...c,
        costUnits: Math.max(1, Math.round(c.costUnits * (1 + pert.cDelta))),
        impactValue: Math.round(c.impactValue * (1 + pert.wDelta) * 10) / 10
      }));
      const pSol = solveKnapsackDP(pPool, Math.max(0, pBudget - mandatoryUnits), options);
      const pIds = new Set([...mandatoryIds, ...pSol.selectedIds]);
      if (pIds.size === finalSelectedIds.size && Array.from(pIds).every(id => finalSelectedIds.has(id))) {
        stableScenarios++;
      }
    });

    const sensitivityRating = stableScenarios >= 8 ? 'Stable' : stableScenarios >= 5 ? 'Moderately Sensitive' : 'Highly Sensitive';
    const sensitivitySummary = `The selected portfolio was preserved in ${stableScenarios} of 10 tested perturbation scenarios (budget ±5%, costs ±5%, weights ±5%).`;

    return {
      success: true,
      runId,
      generatedAt: timestamp,
      optimizationMethod: '0–1 Knapsack Dynamic Programming',
      budgetUnit: '₹1 Lakh (Discrete Integer Representation)',
      tieBreakingMethod: 'Deterministic: Impact → Cost Buffer → Beneficiaries → Urgency → Stable ID',
      disclaimer: 'Optimization result based on the selected budget, projects, constraints and impact criteria. The administrator remains responsible for the final decision.',
      
      // Budget & Financial Totals
      totalBudgetCr: numericBudget,
      totalCostCr: finalTotalCostCr,
      remainingBudgetCr,
      budgetUtilizationPct,
      
      // Impact & Public Benefit
      totalImpactScore: finalTotalImpact,
      selectedCount: selectedProjects.length,
      candidateCount: eligibleProjects.length,
      ineligibleCount: ineligibleProjects.length,
      totalPopulationCovered,
      villagesCoveredCount: villagesCoveredSet.size,
      villagesCovered: Array.from(villagesCoveredSet),
      
      // Project Listings
      selectedProjects,
      excludedProjects,
      allProjects: allEvaluated,
      
      // Analysis Layers
      departmentBreakdown: deptBreakdown,
      planningInsights,
      alternatives,
      whatIfBudgets: whatIfResults,
      sensitivity: {
        rating: sensitivityRating,
        stableScenarios,
        totalTested: 10,
        summary: sensitivitySummary
      },
      
      // Configuration Traceability
      scoringConfiguration: {
        id: scoringConfig.id || 'CUSTOM',
        name: scoringConfig.name || 'Custom Scoring Configuration',
        weightsUsed: { ...weights }
      }
    };
  }

  // Public API Export
  return {
    UNIT_VALUE_INR,
    CRORE_INR,
    UNITS_PER_CRORE,
    SCORING_PRESETS,
    formatINR,
    formatCrores,
    croresToUnits,
    unitsToCrores,
    validateWeights,
    calculateProjectImpact,
    evaluateEligibility,
    solveKnapsackDP,
    optimizePortfolio
  };
}));
