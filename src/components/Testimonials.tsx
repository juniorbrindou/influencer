import React from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Sophie Martin",
    role: "Créatrice de contenu",
    avatar: "/avatars/sophie.jpg",
    content: "Une plateforme incroyable qui met en avant la diversité des créateurs. J'ai été ravie de participer à cette première édition !",
    rating: 5
  },
  {
    id: 2,
    name: "Lucas Dubois",
    role: "Influenceur Gaming",
    avatar: "/avatars/lucas.jpg",
    content: "Le processus de vote est simple et transparent. C'est fantastique de voir une initiative qui valorise vraiment le travail des influenceurs.",
    rating: 5
  },
  {
    id: 3,
    name: "Emma Rousseau",
    role: "Photographe",
    avatar: "/avatars/emma.jpg",
    content: "Une expérience formidable ! La communauté est bienveillante et le concept est innovant. Bravo à toute l'équipe !",
    rating: 5
  }
];

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {testimonial.name.charAt(0)}
      </div>
      <div className="ml-4">
        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
        <p className="text-sm text-gray-600">{testimonial.role}</p>
      </div>
    </div>
    
    <div className="flex mb-3">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} filled={i < testimonial.rating} />
      ))}
    </div>
    
    <p className="text-gray-700 italic leading-relaxed">
      "{testimonial.content}"
    </p>
  </motion.div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Témoignages
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez ce que nos participants et créateurs pensent de cette première édition
          </p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Rejoignez des milliers de participants qui font confiance à notre plateforme
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;