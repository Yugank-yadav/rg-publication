import HeroSection from "@/components/hero-section";

export default function Demo() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Hero Section Demo
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            This page showcases the interactive hero section with
            cursor-tracking 3D book animation. Move your mouse around the hero
            area to see the book respond to your cursor movement.
          </p>

          <div
            className="mt-8 rounded-lg p-6"
            style={{ backgroundColor: "#a8f1ff20" }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Features:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                • Move your cursor over the hero section to see 3D book rotation
              </li>
              <li>
                • Notice the smooth spring animations and floating elements
              </li>
              <li>• Test the responsive design on different screen sizes</li>
              <li>
                • Experience the gradient text and theme color integration
              </li>
            </ul>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Responsive Design
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                The navbar adapts to different screen sizes with a mobile menu
                for smaller devices.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Smooth Animations
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Powered by Framer Motion for smooth dropdown animations and
                transitions.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Accessible
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Built with accessibility in mind, including proper ARIA labels
                and keyboard navigation.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Features</h2>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Team/Organization dropdown with avatar support
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  User profile dropdown with common actions
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Quick action buttons (Search, Inbox)
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Mobile-responsive with hamburger menu
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
