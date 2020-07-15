import React, { useState, useEffect } from "react";
import { Machine } from "xstate";
import { useMachine } from "@xstate/react";

export const workflowMachine = Machine({
  id: "workflow",
  initial: "initial",
  states: {
    initial: {
      entry: ["setup"],
      on: {
        LOADED: "get_run",
        ERROR: "error",
      },
    },
    get_run: {
      entry: ["poll"],
      on: {
        POLL: "get_run_status",
        FAILED: "failed",
        ERROR: "error",
      },
    },
    get_run_status: {
      entry: ["poll_run_status"],
      on: {
        COMPLETED: "completed",
        FAILED: "failed",
        ERROR: "error",
      },
    },
    failed: {},
    error: {
      entry: ["error"],
    },
    completed: {
      type: "final",
    },
  },
});

const TICK = 5000;

const getWorkflowId = async (repo, { send, setWorkflowId }) => {
  try {
    const baseUrl = `https://api.github.com`;
    const baseRepoUrl = `${baseUrl}/repos/${repo}`;
    const workflowsUrl = `${baseRepoUrl}/actions/workflows`;
    const { workflows } = await (await fetch(workflowsUrl)).json();
    if (workflows.length) {
      const { id: workflowId } = workflows[0];
      setWorkflowId(workflowId);
    } else {
      setTimeout(
        () =>
          getWorkflowId(repo, {
            send,
            setWorkflowId,
          }),
        TICK
      );
    }
  } catch (err) {
    console.error(err);
    send("ERROR");
  }
};

const getRunStatus = async ({ repo, runId }, { send, setRunStatus }) => {
  try {
    const baseUrl = `https://api.github.com`;
    const baseRepoUrl = `${baseUrl}/repos/${repo}`;
    const runUrl = `${baseRepoUrl}/actions/runs/${runId}`;
    const { status, conclusion } = await (await fetch(runUrl)).json();

    let m_status, u_status;
    switch (conclusion) {
      case "failure":
        m_status = "FAILED";
        u_status = "Failed";
        break;
      case "success":
        m_status = "COMPLETED";
        u_status = "Successful";
        break;
      case null:
        break;
      default:
        m_status = "ERROR";
        break;
    }

    switch (status) {
      case "queued":
        u_status = "Queued";
        break;
      case "completed":
        break;
      case "in_progress":
        u_status = "Running";
        break;
    }

    setRunStatus(u_status);
    if (m_status) send(m_status);

    if (!conclusion) {
      setTimeout(
        () =>
          getRunStatus(
            { repo, runId },
            {
              send,
              setRunStatus,
            }
          ),
        TICK
      );
    }
  } catch (err) {
    console.error(err);
    send("ERROR");
  }
};

const getRun = async ({ repo, workflowId }, { send, setRunId }) => {
  try {
    const baseUrl = `https://api.github.com`;
    const baseRepoUrl = `${baseUrl}/repos/${repo}`;
    const runsUrl = `${baseRepoUrl}/actions/workflows/${workflowId}/runs`;
    const { workflow_runs } = await (await fetch(runsUrl)).json();
    if (workflow_runs.length) {
      const sortedRuns = workflow_runs.sort(
        ({ created_at: a }, { created_at: b }) => a < b
      );
      const { id } = sortedRuns[0];
      setRunId(id);
    } else {
      setTimeout(
        () =>
          getRun(repo, {
            send,
            setRunId,
          }),
        TICK
      );
    }
  } catch (err) {
    console.error(err);
    send("ERROR");
  }
};

const WorkflowStatus = ({ repo }) => {
  const [workflowId, setWorkflowId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [runStatus, setRunStatus] = useState(null);

  const [_, send] = useMachine(workflowMachine, {
    context: { repo },
    actions: {
      setup: () => {
        setTimeout(() => {
          getWorkflowId(repo, { send, setWorkflowId });
        }, TICK);
      },
      poll: () => {
        getRun({ repo, workflowId }, { send, setRunId });
      },
      poll_run_status: () => {
        getRunStatus({ repo, runId }, { send, setRunStatus });
      },
      error: () => {
        setRunStatus("Error");
      },
    },
  });

  useEffect(() => {
    if (workflowId) send("LOADED");
    if (runId) send("POLL");
  }, [workflowId, runId]);

  let baseColor;
  switch (runStatus) {
    case "Successful":
    case "Running":
      baseColor = "green";
      break;
    case "Error":
    case "Failed":
      baseColor = "red";
      break;
    default:
      baseColor = "indigo";
      break;
  }

  return (
    <div className="mb-4">
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5 bg-${baseColor}-100 text-${baseColor}-800`}
      >
        <svg
          className={`-ml-1 mr-1.5 h-2 w-2 text-${baseColor}-400`}
          fill="currentColor"
          viewBox="0 0 8 8"
        >
          <circle cx="4" cy="4" r="3" />
        </svg>
        Deployment Status: {runStatus ? runStatus : "Initializing"}
      </span>
    </div>
  );
};

export default WorkflowStatus;
