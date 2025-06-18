export const metadata = {
  title: "Shop - Educational Books | RG Publication",
  description:
    "Browse our comprehensive collection of educational books for Mathematics and Science across all class levels from Class 5 to Class 12.",
  keywords:
    "educational books, mathematics books, science books, class 5-12, RG Publication shop",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Educational Book Shop
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive collection of educational books designed
            to enhance learning in Mathematics and Science for students from
            Class 5 to Class 12.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Mathematics Category */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mathematics</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Comprehensive mathematics books covering algebra, geometry,
              calculus, and more for all class levels.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                <a
                  key={classNum}
                  href={`/shop/math/class-${classNum}`}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center text-sm font-medium transition-colors"
                >
                  Class {classNum}
                </a>
              ))}
            </div>
          </div>

          {/* Science Category */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Science</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Engaging science books covering physics, chemistry, biology, and
              environmental science for comprehensive learning.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                <a
                  key={classNum}
                  href={`/shop/science/class-${classNum}`}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded text-center text-sm font-medium transition-colors"
                >
                  Class {classNum}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Books Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Books
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Advanced Mathematics Class 12",
                subject: "Mathematics",
                price: "₹450",
              },
              {
                title: "Physics Fundamentals Class 11",
                subject: "Science",
                price: "₹380",
              },
              {
                title: "Chemistry Concepts Class 10",
                subject: "Science",
                price: "₹320",
              },
            ].map((book, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {book.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2">{book.subject}</p>
                <p className="text-lg font-bold" style={{ color: "#a8f1ff" }}>
                  {book.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
