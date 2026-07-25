import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenario = 'normal', count = 2, duration = 10 } = body;

    const projectRoot = path.resolve(process.cwd(), '..');
    const pythonBin = path.join(projectRoot, 'venv', 'bin', 'python');

    let command = '';
    let description = '';

    if (scenario === 'normal') {
      command = `${pythonBin} app.py --scenario normal --count ${count}`;
      description = `Simulating normal traffic (${count} iterations)`;
    } else if (scenario === 'agent_loop') {
      command = `${pythonBin} app.py --scenario agent_loop --count ${count}`;
      description = `Simulating AI Agent infinite loop storm (${count} retry iterations)`;
    } else if (scenario === 'glitch') {
      command = `${pythonBin} app.py --scenario glitch --count ${count}`;
      description = `Simulating context stuffing token glitch (${count} iterations)`;
    } else if (scenario === 'infra_leak') {
      command = `${pythonBin} infra_emulator.py --scenario infra_leak --duration ${duration}`;
      description = `Simulating unrouted NAT Gateway egress leak (${duration}s pulse)`;
    } else if (scenario === 'idle_resource') {
      command = `${pythonBin} infra_emulator.py --scenario idle_resource --duration ${duration}`;
      description = `Simulating idle compute instance billing (${duration}s pulse)`;
    } else if (scenario === 'sentinel_run') {
      command = `${pythonBin} sentinel.py --run-once --simulate`;
      description = `Executing Cost Sentinel evaluation cycle`;
    } else {
      return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
    }

    const { stdout, stderr } = await execPromise(command, { cwd: projectRoot });

    return NextResponse.json({
      success: true,
      scenario,
      description,
      output: stdout || stderr,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Execution failed',
      stdout: error.stdout,
      stderr: error.stderr,
    }, { status: 500 });
  }
}
