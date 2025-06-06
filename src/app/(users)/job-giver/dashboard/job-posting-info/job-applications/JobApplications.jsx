import React from 'react'

export default function JobApplications({jobApplications}) {
  return (
    <div>
      <ul className="space-y-4">
          {jobApplications.map((app) => (
            <li
              key={app.jobApplicationId}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-800">
                  Applicant ID:{" "}
                  <span className="text-indigo-600">
                    {app.jobApplicationId.slice(0, 8)}…
                  </span>
                </h2>
                <span
                  className={
                    "px-2 py-1 text-sm font-semibold rounded-full " +
                    (app.status === "Submitted"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "Under Review"
                      ? "bg-blue-100 text-blue-800"
                      : app.status === "Interviewing"
                      ? "bg-purple-100 text-purple-800"
                      : app.status === "Offered"
                      ? "bg-green-100 text-green-800"
                      : app.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700")
                  }
                >
                  {app.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                <strong>Applied on:</strong>{" "}
                {new Date(app.applicationDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {app.coverLetterText && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Cover Letter:
                  </p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {app.coverLetterText}
                  </p>
                </div>
              )}

              {app.seekerResumeUrlAtApplication && (
                <div className="mb-2">
                  <a
                    href={app.seekerResumeUrlAtApplication}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline text-sm"
                  >
                    View Resume
                  </a>
                </div>
              )}

              {app.notesBySeeker && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Seeker’s Notes:
                  </p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {app.notesBySeeker}
                  </p>
                </div>
              )}

              {app.notesByGiver && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Your Notes:
                  </p>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {app.notesByGiver}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
    </div>
  )
}
