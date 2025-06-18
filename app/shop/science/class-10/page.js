export const metadata = {
  title: "Class 10 Science Books | RG Publication",
  description:
    "Comprehensive science books for Class 10 students covering physics, chemistry, biology, and environmental science.",
  keywords:
    "class 10 science, physics, chemistry, biology, environmental science, RG Publication",
};

export default function ScienceClass10Page() {
  const books = [
    {
      id: 1,
      title: "Complete Science for Class 10",
      description:
        "Comprehensive coverage of all Class 10 science topics including physics, chemistry, and biology with practical experiments.",
      price: "₹380",
      chapters: [
        "Light - Reflection and Refraction",
        "Human Eye and Colourful World",
        "Electricity",
        "Magnetic Effects of Electric Current",
        "Acids, Bases and Salts",
        "Metals and Non-metals",
        "Carbon and its Compounds",
        "Life Processes",
        "Control and Coordination",
        "How do Organisms Reproduce?",
        "Heredity and Evolution",
        "Our Environment",
        "Management of Natural Resources",
      ],
    },
    {
      id: 2,
      title: "Science Lab Manual Class 10",
      description:
        "Practical experiments and activities for hands-on learning in physics, chemistry, and biology.",
      price: "₹220",
      chapters: [
        "Physics Experiments",
        "Chemistry Experiments",
        "Biology Experiments",
        "Project Work",
      ],
    },
    {
      id: 3,
      title: "Advanced Science Class 10",
      description:
        "Advanced concepts and challenging problems for competitive exam preparation.",
      price: "₹420",
      chapters: [
        "Advanced Physics",
        "Advanced Chemistry",
        "Advanced Biology",
        "Competitive Questions",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/shop" className="text-gray-700 hover:text-gray-900">
                Shop
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700">Science</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Class 10</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Class 10 Science Books
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the fascinating world of science with our comprehensive
            collection of textbooks, lab manuals, and advanced study guides for
            Class 10.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="md:flex">
                {/* Book Cover */}
                <div className="md:w-1/3 bg-gradient-to-br from-green-100 to-blue-100 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔬</div>
                    <h3 className="font-bold text-gray-900">{book.title}</h3>
                  </div>
                </div>

                {/* Book Details */}
                <div className="md:w-2/3 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {book.title}
                    </h2>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "#a8f1ff" }}
                    >
                      {book.price}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6">{book.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Chapters Covered:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {book.chapters.map((chapter, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                        >
                          {chapter}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Add to Cart
                    </button>
                    <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Related Classes */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Other Science Classes
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[5, 6, 7, 8, 9, 11, 12].map((classNum) => (
              <a
                key={classNum}
                href={`/shop/science/class-${classNum}`}
                className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg text-center font-medium transition-colors"
              >
                Class {classNum}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
