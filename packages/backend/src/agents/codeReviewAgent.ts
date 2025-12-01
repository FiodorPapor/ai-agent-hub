// Code Review Agent - Reviews code and provides feedback
// Price: $0.05 per request

export interface CodeReviewResult {
  agent: string;
  code: string;
  language: string;
  review: {
    issues: Array<{
      severity: 'critical' | 'warning' | 'info';
      line?: number;
      message: string;
    }>;
    summary: string;
    score: number; // 0-100
  };
  payment?: {
    amount: string;
    currency: string;
    txHash: string;
    timestamp: string;
  };
}

// Mock code review function
export async function executeCodeReviewAgent(code: string): Promise<CodeReviewResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const lines = code.split('\n');
  const issues: CodeReviewResult['review']['issues'] = [];

  // Simple heuristic checks
  if (code.includes('console.log') && !code.includes('logger')) {
    issues.push({
      severity: 'warning',
      message: 'Consider using a logger instead of console.log for production code'
    });
  }

  if (code.includes('any') && code.includes('TypeScript')) {
    issues.push({
      severity: 'warning',
      message: 'Avoid using "any" type in TypeScript. Use proper type annotations'
    });
  }

  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push({
      severity: 'info',
      message: 'Code contains TODO or FIXME comments. Consider addressing these before deployment'
    });
  }

  if (!code.includes('error') && !code.includes('catch') && code.includes('async')) {
    issues.push({
      severity: 'warning',
      message: 'Async function without error handling. Consider adding try-catch blocks'
    });
  }

  if (lines.length > 200) {
    issues.push({
      severity: 'info',
      message: 'Function is quite long. Consider breaking it into smaller functions'
    });
  }

  // Calculate score based on issues
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'critical') score -= 20;
    else if (issue.severity === 'warning') score -= 10;
    else score -= 3;
  });
  score = Math.max(0, score);

  const summary = issues.length === 0
    ? 'Code looks good! No major issues found.'
    : `Found ${issues.length} issue(s). Code quality score: ${score}/100`;

  return {
    agent: 'code-review',
    code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
    language: 'typescript',
    review: {
      issues,
      summary,
      score
    }
  };
}
