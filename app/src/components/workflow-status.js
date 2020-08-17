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
      default:
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
  var [title] = useState(null);

  const [, send] = useMachine(workflowMachine, {
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
  }, [workflowId, runId, send]);

  let baseColor;
  switch (runStatus) {
    case "Successful":
      baseColor = "green";
      title = "is deployed";
      break;
    case "Running":
      baseColor = "green";
      title = "is deployed";
      break;
    case "Error":
      baseColor = "red";
      title = "had an error";
      break;
    case "Failed":
      baseColor = "red";
      title = "has failed";
      break;
    default:
      baseColor = "indigo";
      break;
  }

  return (
    <div>
      <h1 className="text-header mr-12">
        Project {title ? title : "is deploying"}
      </h1>
      <a
        href={`https://github.com/${repo}/actions`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span
          className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5 bg-${baseColor}-100 text-${baseColor}-800`}
        >
          <svg
            className={`-ml-1 mr-2 h-2 w-2 text-${baseColor}-400`}
            fill="currentColor"
            viewBox="0 0 8 8"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect rx="100" height="100%" width="100%">
              {!runStatus || ["Running", "Queued"].includes(runStatus) ? (
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              ) : null}
            </rect>
          </svg>
          {runStatus ? runStatus : "Initializing"}
        </span>
      </a>
    </div>
  );
};

export default WorkflowStatus;
