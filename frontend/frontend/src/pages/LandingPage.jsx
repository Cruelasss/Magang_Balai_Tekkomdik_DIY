import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { 
  ArrowRight, 
  CheckCircle, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  UserCheck,
  Star,
  Award,
  Users,
  Clock,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Play,
  Zap,
  Shield,
  Target
} from 'lucide-react';

const LandingPage = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(37, 99, 235, ${Math.random() * 0.3})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const drawWave = (offset, amplitude, frequency, color) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height - 100 + 
                 Math.sin(x * frequency + offset) * amplitude + 
                 Math.cos(x * frequency * 0.5) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(219, 234, 254, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(219, 234, 254, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated waves
      const time = Date.now() / 1000;
      
      // Wave 1 (largest)
      drawWave(time * 0.5, 40, 0.005, 'rgba(37, 99, 235, 0.1)');
      
      // Wave 2 (medium)
      drawWave(time * 0.8, 30, 0.008, 'rgba(59, 130, 246, 0.08)');
      
      // Wave 3 (small)
      drawWave(time * 1.2, 20, 0.012, 'rgba(96, 165, 250, 0.06)');

      // Particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect particles with lines
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stats = [
    { value: '98%', label: 'Tingkat Kepuasan', icon: Star },
    { value: '500+', label: 'Alumni Magang', icon: Users },
    { value: '50+', label: 'Mentor Ahli', icon: Award },
    { value: '24/7', label: 'Dukungan Online', icon: Clock }
  ];

  const benefits = [
    { icon: Zap, title: 'Akses Cepat', desc: 'Proses registrasi dan seleksi yang cepat dan efisien' },
    { icon: Shield, title: 'Terpercaya', desc: 'Bekerjasama dengan lebih dari 50 perusahaan terkemuka' },
    { icon: Target, title: 'Tepat Sasaran', desc: 'Program magang sesuai dengan minat dan bakat Anda' }
  ];

  const testimonials = [
    {
      name: 'Ahmad Fauzi',
      role: 'Alumni 2025 - Frontend Dev',
      content: 'Pengalaman magang di sini sangat berharga. Mentornya profesional dan project yang dikerjakan relevan dengan industri.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Alumni 2025 - UI/UX Designer',
      content: 'Lingkungan kerja yang mendukung dan fasilitas lengkap. Sangat direkomendasikan untuk mahasiswa akhir.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=2'
    },
    {
      name: 'Budi Santoso',
      role: 'Alumni 2024 - Backend Dev',
      content: 'Berhasil dapat pekerjaan impian berkat pengalaman dan sertifikat dari program magang ini.',
      rating: 5,
      image: 'https://i.pravatar.cc/150?img=3'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Canvas Background dengan Animasi */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Floating Orbs dengan Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-rotate"></div>
      </div>

      {/* Konten Utama */}
      <div className="relative" style={{ zIndex: 2 }}>
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-all duration-300 group-hover:scale-110"></div>
                  <img src={logo} alt="InternGate" className="relative h-10 w-auto transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Intern-Gate
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                {['Tentang', 'Program', 'Testimoni', 'Kontak'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="relative z-10">Daftar Sekarang</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-36 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" />
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Penerimaan Semester 1 - 2026 Dibuka
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Bangun Karir
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                    Profesional Anda
                  </span>
                  <br />
                  <span className="text-gray-900">di Era Digital</span>
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  Platform monitoring magang terpadu dengan bimbingan langsung dari praktisi ahli. 
                  Dapatkan pengalaman kerja nyata dan sertifikat berstandar industri.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/register" 
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <span className="relative z-10">Mulai Perjalanan Anda</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <button className="group inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative">
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    Lihat Video
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-6">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <div 
                        key={i} 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm"></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">10,000+</span> Mahasiswa telah bergabung
                  </div>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="relative hidden lg:block">
                <div className="relative w-full h-[500px] group">
                  {/* Main Card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Animated Circles */}
                    <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-ping-slow"></div>
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse-slow"></div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-2xl p-4 animate-float-slow">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Bimbingan Mentor</p>
                        <p className="text-xs text-gray-500">50+ Mentor Ahli</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-4 animate-float-slow animation-delay-2000">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="absolute inset-0 bg-blue-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Sertifikat Resmi</p>
                        <p className="text-xs text-gray-500">Berstandar BNSP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={i} 
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-500">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={i} 
                    className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROCEDURE SECTION */}
        <section className="py-20 px-6" id="program">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block bg-white/80 backdrop-blur-sm shadow-lg rounded-full px-4 py-1.5 mb-6 hover:scale-105 transition-transform">
                <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold text-sm">
                  PROSEDUR PENDAFTARAN
                </p>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mulai Perjalanan Karir Anda
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ikuti tahapan seleksi yang transparan dan terstruktur untuk bergabung dengan program magang terbaik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { num: '01', icon: UserCheck, title: 'Registrasi Akun', desc: 'Daftarkan diri Anda dengan mengisi formulir pendaftaran online.', color: 'from-blue-500 to-blue-600' },
                { num: '02', icon: Briefcase, title: 'Pilih Divisi', desc: 'Tentukan bidang magang yang sesuai dengan minat dan keahlian.', color: 'from-purple-500 to-purple-600' },
                { num: '03', icon: FileText, title: 'Seleksi Berkas', desc: 'Tim kami akan melakukan verifikasi berkas dan administrasi.', color: 'from-teal-500 to-teal-600' },
                { num: '04', icon: GraduationCap, title: 'Mulai Magang', desc: 'Bergabung dengan tim dan mulai perjalanan magang Anda.', color: 'from-orange-500 to-orange-600' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-5xl font-black text-gray-200 group-hover:text-blue-100 transition-colors">
                          {item.num}
                        </span>
                        <div className={`bg-gradient-to-br ${item.color} p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h4 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                      
                      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <div className="bg-blue-600 rounded-full p-1">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-blue-50/30" id="testimoni">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block bg-white/80 backdrop-blur-sm shadow-lg rounded-full px-4 py-1.5 mb-6 hover:scale-105 transition-transform">
                <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold text-sm">
                  TESTIMONIAL
                </p>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Apa Kata Mereka?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ribuan alumni telah merasakan manfaat bergabung dengan program magang kami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <div 
                  key={i} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 hover:border-blue-200"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full border-2 border-blue-600 group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-75 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                {/* Animated circles */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping-slow"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 animate-pulse-slow"></div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-pulse-slow">
                    Siap Memulai Karir Impian?
                  </h2>
                  <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Bergabunglah dengan ribuan mahasiswa lainnya yang telah sukses mengembangkan karir melalui program magang kami
                  </p>
                  <Link 
                    to="/register" 
                    className="group/btn inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <span className="relative z-10">Daftar Sekarang</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-12 px-6" id="kontak">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="group">
                <div className="flex items-center gap-2 mb-4 cursor-pointer">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-600 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <img src={logo} alt="InternGate" className="relative h-8 w-auto transform group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Intern-Gate
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Platform monitoring magang terpadu untuk mempersiapkan karir profesional Anda di era digital.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-4 relative inline-block group">
                  Program
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </h4>
                <ul className="space-y-2">
                  {['Frontend', 'Backend', 'UI/UX', 'Mobile Dev'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-all duration-300 hover:translate-x-2 inline-block">
                        Magang {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-4 relative inline-block group">
                  Perusahaan
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </h4>
                <ul className="space-y-2">
                  {['Tentang Kami', 'Kontak', 'Karir', 'Blog'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-all duration-300 hover:translate-x-2 inline-block">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-4 relative inline-block group">
                  Kontak
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-500 group/item">
                    <MapPin className="w-4 h-4 group-hover/item:text-blue-600 transition-colors" />
                    <span className="text-sm group-hover/item:text-gray-900 transition-colors">Balai Tekkomdik DIY</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500 group/item">
                    <Mail className="w-4 h-4 group-hover/item:text-blue-600 transition-colors" />
                    <span className="text-sm group-hover/item:text-gray-900 transition-colors">info@interngate.com</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500 group/item">
                    <Phone className="w-4 h-4 group-hover/item:text-blue-600 transition-colors" />
                    <span className="text-sm group-hover/item:text-gray-900 transition-colors">(0274) 123-456</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                © 2026 Intern-Gate Balai Tekkomdik DIY. All Rights Reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-xs text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-105">
                  Kebijakan Privasi
                </a>
                <a href="#" className="text-xs text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-105">
                  Syarat & Ketentuan
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* STYLE UNTUK ANIMASI */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes ping-slow {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-rotate {
          animation: rotate 20s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;