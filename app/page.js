"use client";
import { useRouter } from "next/navigation";
import { FiGrid, FiUsers, FiBarChart2, FiArrowRight } from "react-icons/fi";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
     <section className="bg-[#4B0082] text-white">
  <div className="max-w-7xl mx-auto py-20 px-6 md:px-10 flex flex-col md:flex-row items-center">
    <div className="md:w-1/2 mb-10 md:mb-0">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        Project Management Made <span className="text-[#FFD700]">Simple</span>
      </h1>
      <p className="text-lg text-gray-100 max-w-lg mb-8">
        Organize your work and collaborate effortlessly with our smart
        Kanban-style project management platform.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => router.push("/auth/signup")}
          className="bg-[#FFD700] hover:bg-[#d3c67b] text-indigo-900 font-semibold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center"
        >
          Get Started <FiArrowRight className="ml-2" />
        </button>
      </div>
    </div>

    {/* Image side */}
    <div className="md:max-w-1/2 flex justify-center">
      <Image
        src="/sensational.jpg"
        alt="PlannyPro Dashboard Preview"
        width={600} // or adjust to your liking
        height={500}
        className="rounded-lg shadow-xl w-full h-auto max-w-md md:max-w-full"
      />
    </div>
  </div>
</section>


      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-indigo-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects efficiently and keep your
              team aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              icon={<FiGrid className="w-8 h-8 text-yellow-400" />}
              title="Intuitive Kanban Boards"
              text="Drag & drop tasks between customizable columns to visualize workflow and track progress."
            />
            <Feature
              icon={<FiUsers className="w-8 h-8 text-[#FFD700]" />}
              title="Team Collaboration"
              text="Assign tasks, mention team members, and collaborate in real-time with comments."
            />
            <Feature
              icon={<FiBarChart2 className="w-8 h-8 text-[#FFD700]" />}
              title="Analytics Dashboard"
              text="Gain insights with visual metrics and track project velocity with interactive charts."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-900 mb-12">
            Trusted by Teams Worldwide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial
              quote="PlannyPro simplified how our remote team handles projects. We actually ship faster now!"
              author="Sarah Johnson"
              role="Product Manager, TechCorp"
            />
            <Testimonial
              quote="The analytics dashboard gives us valuable insights we never had before. Game changer for our agency."
              author="Michael Chen"
              role="Creative Director, DesignWorks"
            />
            <Testimonial
              quote="We reduced project delays by 40% in just two months after switching to PlannyPro."
              author="Jessica Rodriguez"
              role="Operations Lead, StartupX"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#4B0082] text-white py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to transform your project management?
          </h2>
          <p className="text-lg mb-10 text-gray-200 max-w-2xl mx-auto">
            Join PlannyPro.
          </p>
          <button
            onClick={() => router.push("/auth/signup")}
            className="bg-[#FFD700] hover:bg-[#ddcf82] text-[#4B0082] font-semibold py-4 px-8 rounded-lg shadow-lg transition text-lg"
          >
            SignUp Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between">
            <h3 className="text-white font-bold text-lg mb-4">PlannyPro</h3>
            <p className="text-sm">
              Modern project management for teams of all sizes.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} PlannyPro. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-indigo-900 mb-3">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

function Testimonial({ quote, author, role }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-md">
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-indigo-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}
