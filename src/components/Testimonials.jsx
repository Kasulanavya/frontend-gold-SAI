"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Small Business Owner",
    initials: "PS",
    rating: 5,
    text: `"SabPe Gold made gold investing so simple. I started with just ₹500 and now have a growing portfolio. The app is incredibly easy to use!"`
  },
  {
    name: "Rajesh Kumar",
    role: "Software Engineer",
    initials: "RK",
    rating: 5,
    text: `"The live price tracking and instant buy feature are fantastic. I love that my gold is stored in insured vaults. Truly trustworthy platform."`
  },
  {
    name: "Anita Desai",
    role: "Teacher",
    initials: "AD",
    rating: 5,
    text: `"I was always hesitant about digital gold, but SabPe's transparency and 24K purity guarantee won me over. Great experience so far!"`
  },
  {
    name: "Vikram Patel",
    role: "Freelancer",
    initials: "VP",
    rating: 4,
    text: `"Selling gold and getting instant payouts is a game changer. SabPe Gold is my go-to platform for gold investments now."`
  }
];

export default function Testimonials() {
  return (
    <section className="bg-black text-white py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-16">
          <p className="text-yellow-500 tracking-widest font-semibold">
            TESTIMONIALS
          </p>

          <h2 className="text-4xl lg:text-5xl font-bold mt-2">
            Loved by <span className="text-yellow-400">Investors</span>
          </h2>

          <p className="text-gray-400 mt-4">
            Hear from our community of gold investors across India
          </p>
        </div>

        {/* TESTIMONIAL CARDS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition"
            >

              {/* STARS */}

              <div className="flex mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={`mr-1 ${
                      index < item.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* TEXT */}

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {item.text}
              </p>

              {/* USER */}

              <div className="flex items-center gap-3">

                <div className="bg-yellow-500/10 text-yellow-400 w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                  {item.initials}
                </div>

                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-400 text-sm">{item.role}</p>
                </div>

              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}