"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"

export default function About() {
  const stats = [
    { number: "50,000+", label: "Estudiantes Activos", icon: "👥" },
    { number: "200+", label: "Lecciones Disponibles", icon: "📚" },
    { number: "95%", label: "Tasa de Satisfacción", icon: "⭐" },
    { number: "15", label: "Idiomas Soportados", icon: "🌍" }
  ]

  const values = [
    {
      icon: "🤝",
      title: "Inclusividad",
      description: "Creemos que la educación debe ser accesible para todos, sin importar su origen, idioma o capacidades."
    },
    {
      icon: "🎯",
      title: "Personalización",
      description: "Cada estudiante es único. Nuestra IA adapta el contenido a las necesidades individuales de aprendizaje."
    },
    {
      icon: "🌱",
      title: "Crecimiento Continuo",
      description: "Fomentamos el aprendizaje permanente y el desarrollo de habilidades para el futuro."
    },
    {
      icon: "💡",
      title: "Innovación",
      description: "Utilizamos las últimas tecnologías de IA para crear experiencias de aprendizaje revolucionarias."
    }
  ]

  const team = [
    {
      name: "Dr. María González",
      role: "CEO & Fundadora",
      image: "👩‍💼",
      bio: "Experta en IA educativa con 15+ años en el sector. Doctora en Ciencias de la Computación por la UNAM.",
      expertise: ["IA Educativa", "Machine Learning", "Liderazgo"]
    },
    {
      name: "Carlos Mendoza",
      role: "CTO",
      image: "👨‍💻",
      bio: "Ingeniero de software especializado en sistemas de IA adaptativa. Experto en tecnologías emergentes.",
      expertise: ["Arquitectura de Software", "IA", "Cloud Computing"]
    },
    {
      name: "Ana Rodríguez",
      role: "Directora de Contenido",
      image: "👩‍🏫",
      bio: "Pedagoga con maestría en Educación Inclusiva. Especialista en diseño de contenido multicultural.",
      expertise: ["Pedagogía", "Educación Inclusiva", "Contenido Multicultural"]
    },
    {
      name: "Luis Torres",
      role: "Director de UX/UI",
      image: "👨‍🎨",
      bio: "Diseñador de experiencias de usuario con enfoque en accesibilidad y diseño inclusivo.",
      expertise: ["UX/UI", "Accesibilidad", "Diseño Inclusivo"]
    }
  ]

  const timeline = [
    {
      year: "2020",
      title: "Nacimiento de la Idea",
      description: "Un grupo de educadores y tecnólogos se unen para crear una plataforma educativa verdaderamente inclusiva."
    },
    {
      year: "2021",
      title: "Primer Prototipo",
      description: "Desarrollo del primer prototipo con IA básica y soporte para 3 idiomas indígenas."
    },
    {
      year: "2022",
      title: "Lanzamiento Beta",
      description: "Lanzamiento de la versión beta con 1,000 estudiantes y 50 lecciones iniciales."
    },
    {
      year: "2023",
      title: "Expansión Nacional",
      description: "Alcanzamos 25,000 estudiantes y agregamos soporte para 10 idiomas adicionales."
    },
    {
              year: "2025",
      title: "Reconocimiento Internacional",
      description: "Premio a la Innovación Educativa por la UNESCO y expansión a 15 idiomas."
    },
    {
      year: "2025",
      title: "Futuro Inclusivo",
      description: "Continuamos innovando para hacer la educación accesible a millones más de estudiantes."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Somos un equipo apasionado por democratizar la educación a través de la inteligencia artificial. 
              Nuestra misión es hacer que el aprendizaje sea accesible, personalizado y efectivo para todos, 
              sin importar su origen o circunstancias.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <span className="mr-3">🎯</span>
                  Nuestra Misión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Transformar la educación mediante la inteligencia artificial para crear un mundo donde 
                  cada persona, sin importar su origen, idioma o capacidades, tenga acceso a una educación 
                  de calidad que se adapte a sus necesidades individuales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <span className="mr-3">🔮</span>
                  Nuestra Visión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ser la plataforma educativa líder en inclusión y personalización, llegando a millones 
                  de estudiantes en todo el mundo y contribuyendo a cerrar la brecha educativa global 
                  mediante tecnología innovadora y accesible.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Nuestro Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4">{member.image}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Nuestra Historia
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
              
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className={cn(
                    "relative flex items-center",
                    index % 2 === 0 ? "justify-start" : "justify-end"
                  )}>
                    <div className={cn(
                      "w-5/12",
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                    )}>
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-blue-600 mb-2">{item.year}</div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Únete a Nuestra Misión
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Ayúdanos a hacer la educación más accesible e inclusiva para todos
                </p>
                <div className="space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Comenzar a Aprender
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Contactar Equipo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
