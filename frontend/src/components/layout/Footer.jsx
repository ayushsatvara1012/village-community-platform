import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/v-logo.png"
                                alt="Logo"
                                className="w-10 h-10 object-contain brightness-0 invert"
                            />
                            <span className="font-bold font-gujarati text-2xl text-white">સતવારા <span className='text-orange-500'>૩૨</span> સમાજ</span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Dedicated to the progress and unity of the Satvara community. Building a stronger future together through education, social work, and mutual support.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/villages" className="hover:text-white transition-colors">Villages</Link></li>
                            <li><Link to="/members" className="hover:text-white transition-colors">Members Directory</Link></li>
                            <li><Link to="/donate" className="hover:text-white transition-colors">Donate</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Rules & Regulations</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>Main Community Hall, Sector 12, Gandhinagar, Gujarat - 382010</span>
                            </li>
                            <li className="flex gap-3">
                                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>contact@satvarasamaj32.org</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center text-xs">
                    <p>&copy; {new Date().getFullYear()} Satvara 32 Samaj. All rights reserved. Designed with ❤️ for the community.</p>
                </div>
            </div>
        </footer>
    );
}
