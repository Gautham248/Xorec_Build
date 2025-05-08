import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Users, Target, Award, Clock } from 'lucide-react';

const About = () => {
  const sectionRef = useRef(null);

  const stats = [
    { icon: <Users size={32} />, value: "25+", label: "Team Members" },
    { icon: <Target size={32} />, value: "8+", label: "Years Experience" },
    { icon: <Award size={32} />, value: "500+", label: "Projects Completed" },
    { icon: <Clock size={32} />, value: "24/7", label: "Support Available" }
  ];

  const founders = [
    {
      name: "Eby Eldho Ealiyas",
      position: "CEO",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/EBY.png?updatedAt=1746546867702",
      bio: "With over 7 years of industry experience, Eby leads our brand's strategic direction, driving Xorec towards its vision."
    },
    {
      name: "Nithin Nambiar",
      position: "CCO",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/NITHIN.png?updatedAt=1746546867736",
      bio: "Nithin brings our creative vision to life and driving innovation across every project he oversees."
    },
    {
      name: "Vishak",
      position: "CTO",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/VISHAK.png?updatedAt=1746546867720",
      bio: "Vishak specializes in cutting-edge cinematography and visual effects supervision."
    }
  ];
  
  const coreTeam = [
    {
      name: "Blessy Sabu",
      position: "Head of Production",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/BLESSY%20SABU.png?updatedAt=1746714783998",
    },
    {
      name: "Samuel V Saji",
      position: "Visual Director",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/SAMUEL%20V%20SAJI.png?updatedAt=1746714783277",
    },
    {
      name: "Abhiram M S",
      position: "Post Production Supervisor ",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/ABHIRAM%20M%20S.png?updatedAt=1746714783974",
    },
    {
      name: "Bibin Binu",
      position: "Visual Content Head",
      image: "https://ik.imagekit.io/x5qi7yd2f/FINAL%20BATCH/TEAM/BIBIN%20BINU.png?updatedAt=1746714783823",
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-title span',
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.about-title',
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-20">
      <section ref={sectionRef} className="bg-white py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-16">
            <h1 className="about-title text-5xl md:text-6xl font-bold mb-6">
              <div className="overflow-hidden">
                <span>Who We</span> <span className="text-accent"> Are</span>
              </div>
           
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We are a team of passionate creators, innovators, and storytellers dedicated to bringing your vision to life through exceptional video production.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-zinc-100 p-8 rounded-lg border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 text-black">Our Mission</h2>
              <p className="text-gray-700">
                To create compelling visual stories that inspire, engage, and deliver exceptional value to our clients while pushing the boundaries of creative excellence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-zinc-100 p-8 rounded-lg border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 text-black">Our Vision</h2>
              <p className="text-gray-700">
                To be the leading force in innovative video production, setting new standards in storytelling and technical excellence across global markets.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-accent mx-auto mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-black mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Founders */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Leaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
              {founders.map((founder, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-zinc-100 p-6 rounded-lg border border-gray-200 shadow-lg text-center"
                >
                  <div className="mb-4 overflow-hidden rounded-md">
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{founder.name}</h3>
                  <p className="text-neutral-900 mb-4">{founder.position}</p>
                  <p className="text-gray-600">{founder.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Core Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Our Core Team</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {coreTeam.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-zinc-100 p-4 rounded-lg border border-gray-200 shadow-lg text-center w-56"
                >
                  <div className="mb-3 overflow-hidden rounded-md">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-1">{member.name}</h3>
                  <p className="text-neutral-900 text-sm">{member.position}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Excellence", description: "We strive for excellence in every frame, every project, and every client interaction." },
                { title: "Innovation", description: "We embrace new technologies and creative approaches to push the boundaries of what's possible." },
                { title: "Collaboration", description: "We believe in the power of teamwork and partnership with our clients." },
                { title: "Integrity", description: "We maintain the highest standards of professional integrity and transparency." },
                { title: "Creativity", description: "We bring fresh perspectives and creative solutions to every challenge." },
                { title: "Results", description: "We are committed to delivering measurable results that exceed expectations." }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-zinc-100 p-6 rounded-lg border border-gray-200 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;