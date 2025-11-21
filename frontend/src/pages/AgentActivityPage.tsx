import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgentWebSocket } from '../hooks/useAgentWebSocket';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PlayIcon,
  HomeIcon,
  InformationCircleIcon,
  ExclamationIcon,
} from '@heroicons/react/outline';

const stepLabels = [
  { key: 'createJiraTicket', label: 'Create JIRA Bug Ticket', icon: '🎫' },
  { key: 'addJiraComment', label: 'Add Comment to JIRA', icon: '💬' },
  { key: 'analyzeCode', label: 'Analyze Codebase', icon: '🔍' },
  { key: 'generateFix', label: 'Generate Fix', icon: '🔧' },
  { key: 'createPR', label: 'Create GitHub PR', icon: '📝' },
  { key: 'updateJira', label: 'Update JIRA with PR Link', icon: '✅' },
];

export default function AgentActivityPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { task, connected, error } = useAgentWebSocket(taskId || null);

  const getStepIcon = (status: string) => {
    const iconClass = "w-6 h-6";
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'in-progress':
        return <PlayIcon className={`${iconClass} text-blue-500 animate-pulse`} />;
      case 'failed':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      default:
        return <ClockIcon className={`${iconClass} text-gray-400`} />;
    }
  };

  const getActivityIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationIcon className={`${iconClass} text-yellow-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6 mb-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <ExclamationCircleIcon className="w-8 h-8 text-red-400" />
              <p className="text-red-200 text-lg">{error}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200/20 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-500/30 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Agent Activity...</h2>
          <p className="text-purple-200">Connecting to AI Agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative mb-8 backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl shadow-lg">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                  AI Agent Activity
                </h1>
                <p className="text-purple-300 text-sm mt-1">Real-time workflow monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md shadow-lg transition-all duration-300 ${
                connected
                  ? 'bg-green-500/20 text-green-200 border border-green-500/30 animate-pulse'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-md shadow-lg border ${
                task.status === 'complete' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-200 border-blue-500/30 animate-pulse' :
                task.status === 'failed' ? 'bg-red-500/20 text-red-200 border-red-500/30' :
                'bg-gray-500/20 text-gray-300 border-gray-500/30'
              }`}>
                {task.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2 bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-purple-100">
              <strong className="text-purple-300">Issue:</strong> {task.issue}
            </p>
            <p className="text-purple-200 text-sm">
              <strong className="text-purple-300">File:</strong> <code className="bg-purple-500/20 px-2 py-1 rounded">{task.file}</code>
            </p>
          </div>
        </div>

        {/* Links */}
        {(task.jiraTicketUrl || task.prUrl) && (
          <div className="relative mb-8 flex space-x-4">
            {task.jiraTicketUrl && (
              <a
                href={task.jiraTicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border border-orange-500/30 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 shadow-lg hover:shadow-orange-500/20 transform hover:scale-105"
              >
                <span className="text-2xl mr-3 group-hover:animate-bounce">🐛</span>
                <div>
                  <div className="text-orange-200 font-semibold">View JIRA Ticket</div>
                  <div className="text-orange-300 text-xs">{task.jiraTicketKey}</div>
                </div>
              </a>
            )}
            {task.prUrl && (
              <a
                href={task.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
              >
                <span className="text-2xl mr-3 group-hover:animate-bounce">📝</span>
                <div>
                  <div className="text-purple-200 font-semibold">View Pull Request</div>
                  <div className="text-purple-300 text-xs">#{task.prNumber}</div>
                </div>
              </a>
            )}
          </div>
        )}

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Progress Steps */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Progress</h2>
            </div>
            <div className="space-y-6">
              {stepLabels.map((stepInfo, index) => {
                const step = task.steps[stepInfo.key as keyof typeof task.steps];
                const isLast = index === stepLabels.length - 1;

                return (
                  <div key={stepInfo.key} className="relative">
                    <div className={`flex items-start p-4 rounded-xl transition-all duration-300 ${
                      step.status === 'in-progress' ? 'bg-blue-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/20' :
                      step.status === 'complete' ? 'bg-green-500/10 border border-green-500/20' :
                      step.status === 'failed' ? 'bg-red-500/10 border border-red-500/20' :
                      'bg-white/5 border border-white/10'
                    }`}>
                      <div className="flex-shrink-0 transform transition-transform duration-300 hover:scale-110">
                        {getStepIcon(step.status)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{stepInfo.icon}</span>
                          <h3 className={`font-semibold text-lg ${
                            step.status === 'complete' ? 'text-green-300' :
                            step.status === 'failed' ? 'text-red-300' :
                            step.status === 'in-progress' ? 'text-blue-300' :
                            'text-gray-300'
                          }`}>
                            {stepInfo.label}
                          </h3>
                        </div>
                        {step.message && (
                          <p className="text-sm text-purple-200 mt-2 bg-black/20 rounded-lg p-2">{step.message}</p>
                        )}
                        {step.progress !== undefined && step.status === 'in-progress' && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                              <div
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg animate-pulse"
                                style={{ width: `${step.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-300 mt-1 font-semibold">{step.progress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isLast && (
                      <div className="absolute left-7 top-20 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {task.status === 'complete' && (
              <div className="mt-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm shadow-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🎉</span>
                  <p className="text-green-200 font-bold text-lg">AI Agent workflow completed successfully!</p>
                </div>
              </div>
            )}

            {task.status === 'failed' && (
              <div className="mt-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">❌</span>
                  <p className="text-red-200 font-bold text-lg">AI Agent workflow failed. Check the activity log for details.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Activity Log */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 max-h-[700px] overflow-hidden flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <span className="text-xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Activity Log</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {task.activityLog.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-purple-100 leading-relaxed">{log.message}</p>
                    <p className="text-xs text-purple-300 mt-2 flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 border border-white/20"
          >
            <HomeIcon className="w-6 h-6 mr-3 group-hover:animate-bounce" />
            <span className="text-lg">Back to Home</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}

