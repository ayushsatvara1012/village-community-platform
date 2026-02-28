import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, BookOpen } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
/**
 * Sophisticated Community History Page
 * Theme: Heritage Saffron (#C8410B, #F5A623)
 * Features: Scroll Progress, Sticky Nav (offset), Intersection Observer Animations
 */

const History = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const sectionRefs = useRef([]);

    const chapters = [
        {
            id: 1,
            name: "Origin",
            title: "નામ, અર્થ અને પ્રકારો",
            myth: "સમાજના વિવિધ નામો સત્વારા સમાજ ગુજરાત, સૌરાષ્ટ્ર અને કચ્છ પ્રદેશમાં વિવિધ નામોથી ઓળખાય છે: સથવારા / સત્વારા  — સૌથી વ્યાપક ઉપયોગમાં આવતું કડિયા સત્વારા  — ઉત્તર ગુજરાતમાં, ચણતરકામ સાથે સંકળાયેલ ઉપ-સમૂહ દલવાડી — જામનગર અને સૌરાષ્ટ્ર વિસ્તારમાં આ નામ વ્યાપક છે કુશવાહા — ઉત્તર ભારતમાં આ સમાજ 'કુશવાહા' નામે ઓળખાય છે",
            desc: "'સત્વારા' નામનો અર્થ ગુજરાતી ભાષાના 'સત્ત'(= સત્ય),  'સાથ'(= સહકાર) સત્ય અને સાથ આપનારા. ઐતિહાસિક રીતે, ભૂ- સ્વામીઓ અથવા રાજ્ય માટે ૬૦ ના જૂથ(ટોળી)માં ખેતી અને મજૂરી - કામ કરવા જતા હોવાથી 'સત્વારા ' નામ પ્રચલિત થયું.આ નામ સામૂહિક કાર્ય - સંસ્કૃતિ અને સહાય - ભાવના દર્શાવે છે. 'કડિયા' નામનો અર્થ 'કડિયા' શબ્દ ગુજરાતી / રાજસ્થાની ભાષામાં ચણતરકામ(ઇંટ - ચૂના - પત્થર વડે ઇમારત બાંધનારા) કારીગરો માટે વપરાય છે. 'કડિયા સત્વારા ' ઉત્તર ગુજરાત, સૌરાષ્ટ્ર અને કચ્છના રજવાડી રાજ્યોમાં ઇમારત - નિર્માણ, મંદિર - નિર્માણ અને વાવ - નિર્માણ ક્ષેત્રે ઉત્કૃષ્ટ ફાળો આપ્યો.",
            quote: "આપણે ક્યાં જઈ રહ્યા છીએ તે જાણવા માટે, આપણે સૌથી પહેલા આપણે કોણ છીએ તેના અર્થને સન્માન આપવું જોઈએ: 'સત્યના સંતાનો'.",
            facts: ["Sanskrit Roots", "Ethical Mandate", "Master Builders", "Truth-Seekers"],
            know: "The earliest mentions of our guilds were found in copper-plate inscriptions dating back to the late 11th century!",
            image: "/ch-1.2_satvara.webp",
            caption: "Ancient temple architecture showcasing the masonry skills of our early ancestors."
        },
        {
            id: 2,
            name: "Mythology",
            title: "પૌરાણિક અને દંતકથાકીય ઉત્પત્તિ",
            myth: "આબુ પર્વત — ઉત્પત્તિ સ્થળ સત્વારા  સમાજ રાજસ્થાનના આબુ પર્વત (Mount Abu) ના ઢોળાવ પર આવેલ 'આધ્ડ-દેવી' (Addhardevi) ના સ્થળ સાથે ઊંડો ધાર્મિક સંબંધ ધરાવે છે. આ દેવીને સમાજ પોતાની 'કુળ-દેવી' ગણે છે. આ સ્થળ આજે પણ સત્વારા  સમાજ માટે સૌથી પવિત્ર યાત્રા-ધામ છે — આધ્ડ-દેવી મંદિર, આબુ-રોડ, સિરોહી જિલ્લો, રાજસ્થાન. રાજપૂત-કુર્મી વારસાની કથા બીજી પ્રચલિત ઐતિહાસિક કથા અનુસાર, સત્વારા  સમાજ ઉત્તર ભારતના એક ક્ષત્રિય (રાજપૂત) પૂર્વજ અને એક કુર્મી (ખેડૂત) સ્ત્રીના વંશ-પ્રવાહ માંથી ઉત્પન્ન થયો. ઉત્તર ભારત છોડ્યા બાદ, આ પૂર્વજ-ટોળું ક્રમશઃ ગુજરાત, સૌરાષ્ટ્ર, કચ્છ અને ઉત્તર ગુજરાત તરફ સ્થળાંતર થયું.",
            desc: "પરશુરામ અને ક્ષત્રિય વારસો સત્વારા  સમાજ પોતાની ઉત્પત્તિ ક્ષત્રિય વર્ણ સાથે જોડે છે.સૌથી પ્રચલિત પૌરાણિક કથા પ્રમાણે, ભગવાન પરશુરામ — જે ક્ષત્રિય વીરોને ૨૧ વખત ધરતી ફર્યા — તેમના ક્રોધ અને આક્રમણથી બચવા ક્ષત્રિયોએ તલવાર- ઢાલ ત્યજી, ખેડૂત - ધર્મ અંગીકાર કર્યો.ક્ષત્રિયો ખેડૂત બન્યા, પણ શૌર્ય, સ્વાભિમાન અને ક્ષત્રિય - ધર્મ ચાલુ રહ્યો.",
            quote: "માણસ આપણને શીખવે તે પહેલાં, દૈવી શક્તિએ (ભગવાનના હાથે) આપણા હાથોનું માર્ગદર્શન કર્યું હતું.",
            facts: ["Vishwakarma Lineage", "Saffron Blessing", "Guardian Spirits", "Divine Craft"],
            know: "Many of our elderly still perform a 'Tool Puja' every Dussehra to honor the mythological origins of our profession.",
            image: "/ch-1_satvara.webp",
            caption: "A depiction of traditional stonework inspired by divine architectural patterns."
        },
        {
            id: 3,
            name: "Migration",
            title: "ઐતિહાસિક સ્થળાંતર અને વસાહત",
            myth: "ગુજરાતમાં મુખ્ય વસ્તી-ક્ષેત્રો આ સમાજ ગુજરાતના નીચેના જિલ્લાઓમાં સૌથી વધુ સ્થાયી થયો:ઉત્તર ગુજરાત: પાટણ, મહેસાણા, બનાસકાંઠા, સાબરકાંઠા સૌરાષ્ટ્ર: સુરેન્દ્રનગર, જૂનાગઢ, ભાવનગર, રાજકોટ, મોરબી કચ્છ: ભુજ, જામનગર, અમરેલી ઉત્તર ગુજરાત ભૂ-ભાગ: ડાંડારિયા (સાબરકાંઠા), પટ્ટણવાડિયા અને ડાંઢવ્ય (મહેસાણા)",
            desc: "ઉત્તર ભારત → ગુજરાત — સ્થળાંતર ઐતિહાસિક સ્ત્રોત અનુસાર, સત્વારા  સમાજ મૂળ ઉત્તર ભારત (રાજપૂતાના) માંથી ક્રમશઃ ગુજરાત-સૌરાષ્ટ્ર તરફ આવ્યો. આ સ્થળાંતર ઘણા ઐતિહાસિક તબક્કામાં થયું: પ્રથમ તબક્કો: રાજપૂતાના → ઉત્તર ગુજરાત (પાટણ, મહેસાણા) દ્વિતીય તબક્કો: ઉત્તર ગુજરાત → સૌરાષ્ટ્(સુરેન્દ્રનગર, જૂનાગઢ, ભાવનગર) તૃતીય તબક્કો: સૌરાષ્ટ્ર → કચ્છ (ભુજ, મોરબી, જામનગર)",
            quote: "અમે માત્ર આ ધરતી પર પ્રયાણ નથી કર્યું; અમે એ રસ્તાઓનું પણ નિર્માણ કર્યું છે જેના પર અમે ચાલ્યા છીએ.",
            facts: ["14th Century Wave", "Northern Roots", "Dandhavya Settlement", "The 32 Path"],
            know: "The specific dialect used in some of our older villages still retains words from the nomadic languages used during the great migration!",
            image: "/ch-3.webp",
            caption: "The landscape of our heritage: Roads and landmarks built during the centuries of migration."
        },
        {
            id: 4,
            name: "Structure",
            title: "વર્ણ, જ્ઞાતિ અને સામાજિક સ્થાન",
            myth: "સ્વતંત્ર ભારત બાદ — SEBC દરજ્જો ભારતની આઝાદી (1947) બાદ: 1953: સૌરાષ્ટ્ર સરકારે 'માજમદાર કમિટી' નિમી, પછાત વર્ગો નક્કી કર્યા 1954: સત્વારા  સમાજ ત્યારે 'પછાત વર્ગ' (Backward Class) ઘોષિત 1956: સૌરાષ્ટ્ર → ગુજરાત વિલીનીકરણ; 1960 → ગુજરાત રાજ્ય-રચના આજે: ગુજરાત SEBC (Socially & Educationally Backward Classes) સૂચિ હેઠળ નોંધાયેલ — સથવારા, સત્વારા, કડિયા-સતવારા , કડિયા સત્વારા, દલવાડી, કડિયા — બધા નામો SEBC માં",
            desc: "ક્ષત્રિય-વર્ણ દાવો સત્વારા  સમાજ ઐતિહાસિક રીતે ક્ષત્રિય વર્ણ સાથે પોતાની ઓળખ ધરાવે છે. ભારતીય સમાજ-વ્યવસ્થામાં ક્ષત્રિય = શૌર્ય, રક્ષણ, ભૂ-સ્વામિત્વ અને શાસન. ખેતી અને ચણતર-વ્યવસાય અંગીકાર્યા પછી પણ, સમાજ ક્ષત્રિય ઓળખ ટકાવી રાખ્યો. 'થેર-તાસિડી' સમૂહ સત્વારા  સમાજ ગુજરાતના 'થેર-તાસિડી' ના હિન્દૂ જ્ઞાતિ-સમૂહ નો ભાગ છે. એટલે કે, આ જ્ઞાતિ-સમૂહ અંતર-ભોજન ની રૂઢ સ્વીકારે છે. આ ઐતિહાસિક સામૂહિક-સ્વીકૃતિ, સત્વારા  સમાજના ઉચ્ચ-સ્થાનને પ્રતિષ્ઠિત કરે છે.",
            quote: "એક તાંતણો સહેલાઈથી તૂટી જાય છે, પરંતુ બત્રીસ ગામની એકતા એ એવું દોરડું છે જેને ક્યારેય તોડી શકાતું નથી.",
            facts: ["The 32 Samaaj", "Clan Surnames", "Decentralized Rule", "Kinship Laws"],
            know: "Registration of lineage in our community was historically kept by wandering bards who could recite family trees back fifteen generations!",
            image: "/ch-4.webp",
            caption: "A gathering of community leaders discussing social welfare and village development."
        },
        {
            id: 5,
            name: "Occupation",
            title: "વ્યવસાય",
            myth: "ખેતી સત્વારા  સમાજ ઐતિહાસિક રીતે ખેતી-પ્રધાન સમુદાય છે. સૌરાષ્ટ્ર-ઉત્તર ગુજરાતની કાળી અને ગોળ ભૂમિ ઉપર: ઘઉં, બાજરો, મગ, ચણા, કપાસ — મુખ્ય પાકો ઢોર-ઉછેર — દૂધ, ઘી, ખેત-મજૂરી ઓડ-ચૂના સ-ઉત્પાદન — ઇમારત-સામગ્રી ઊંટ-ઉછેર — કચ્છ વિસ્તારમાં સિઝનલ ઇરિગેશન — ઘઉં, ચોખા. ઐતિહાસિક સૈન્ય-સેવા ઘણા સત્વારા -ક્ષત્રિય યુવાઓ રજવાડા/ઠાકોરની ફોજ માં સૈન્ય-સેવા ભજવ્યો. ૧૮-૧૯મી સદીના સૌરાષ્ટ્ર-ગઢ/ઠેકાણા ના રક્ષણ-કાર્ય-ઇતિહાસ — સત્વારા -ક્ષત્રિય-સૈનિકોની ભૂમિ-ભૂષા.",
            desc: " ચણતર-કળા / કડિયા-કામ 'કડિયા' ઉપ-સમૂહ ગુજરાતની ઇમારત-સ્થાપત્ય-વિરાસતનો આત્મા છે. આ કારીગરોએ ગુજરાત-સૌરાષ્ટ્ર-કચ્છના રાજ-સ્થાપત્ય, ધાર્મિક-સ્થળ, અને જળ-સ્થળ ના નિર્માણ-કાર્ય ઉઠાવ્યા: વાવ  — ઉત્તર ગુજરાત-પ્રદેશ ગઢ  — સૌરાષ્ટ્ર રજવાડા ઝૂળ-ગૃહ  — ઇન્ડો-સારેસેનિક મંદિર  — ઉત્કીર્ણ  પ્રવેશ-દ્વાર, સ્તંભ મહેલ  — ૧૮-૧૯મી સદી પત્થર-ઉત્કીર્ણ — ઝીણવટ-ભરી જાળી-કળા",
            quote: "અમે ગોઠવેલો દરેક પથ્થર ભવિષ્ય માટેની એક પ્રાર્થના હતી; અને અમે ખેડેલું દરેક ખેતર અમારા સંતાનો માટેનો લણણીનો ઉત્સવ હતો.",
            facts: ["Master Masons", "Civil Engineers", "Heritage Builders", "Skill Passing"],
            know: "Some of the ancient step-wells (Vavs) built by our ancestors still stand today, perfectly level and structurally sound after 500 years!",
            image: "/ch-5.webp",
            caption: "Intricate stone carvings representing the peak of our community's traditional craftsmanship."
        },
        {
            id: 6,
            name: "Spirituality",
            title: "ધર્મ અને આધ્યાત્મિક જીવન",
            myth: "કુળદેવી ઉપાસના અને માતૃશક્તિ સતવારા અને કડિયા જ્ઞાતિમાં કુળદેવીનું સ્થાન સર્વોપરી છે. દરેક અટક (ચૌહાણ, પરમાર, મકવાણા, ચાવડા વગેરે) મુજબ તેમની અલગ-અલગ કુળદેવીઓ હોય છે. શ્રદ્ધા: કોઈપણ શુભ કાર્યની શરૂઆત કુળદેવીના આશીર્વાદથી જ થાય છે.આધ્યાત્મિક જોડાણ: માઉન્ટ આબુ પર બિરાજમાન અધ્ધરદેવી (અર્બુદા દેવી) પ્રત્યે આ સમાજને અપાર શ્રદ્ધા છે, જે તેમના પૂર્વજોના ઇતિહાસ સાથે જોડાયેલ છે.કર્મ એ જ ભક્તિ આ સમાજ માટે તેમનું કૌશલ્ય—પછી તે ખેતી હોય કે સ્થાપત્ય (કડિયા કામ)—તે માત્ર વ્યવસાય નથી, પણ એક દૈવી સેવા છે. વિશ્વકર્મા દાદાની પૂજા: કડિયા જ્ઞાતિ ભગવાન વિશ્વકર્માને પોતાના આરાધ્ય દેવ માને છે. સાધનોની પૂજા કરવી અને નિર્માણ કાર્યમાં પવિત્રતા જાળવવી એ તેમની આધ્યાત્મિક શિસ્તનો ભાગ છે. ભક્તિ અને કૃષિ: ખેતી કરતો સતવારા સમાજ ધરતીને 'માતા' માને છે અને ખેતર ખેડવું એ તેમના માટે કુદરતની પૂજા સમાન છે.",
            desc: "હિન્દૂ ધર્મ સત્વારા  સમાજ હિન્દૂ ધર્મ પ્રધાન સમુદાય છે. ઘર-ઘરમાં ભગવાન શિવ, ગણેશ, માતાજી, રામ-કૃષ્ણ ની પૂજા-અર્ચના. ગ્રામ-સ્તરે ગ્રામ-દેવી ની સ્થળ-પૂજા — ગ્રામ-ઉત્સવ નો ઐતિહાસ. આઘ-દેવી (Addhardevi) — કુળ-દેવી આધ્ડ-દેવી — સત્વારા  સમાજ, ખાસ ઉત્તર ગુજરાત અને સૌરાષ્ટ્ર-ઉપ-ભાગ, ની 'કુળ-દેવી'. ઐતિહાસિક સ્ત્રોત અનુસાર, 2000 + વર્ષ ની ઉપાસના-પ્રણાલ. નવરાત્રિ, ચૈત્ર-નવ-તિ,દિવાળી — ખૂબ ઉત્સવ ભરેલ.",
            quote: "અમે ફક્ત મંદિરો જ નથી બાંધતા; અમે અમારા જીવનને સત્યનું એક જીવંત મંદિર (શ્રદ્ધાસ્થાન) બનાવવા મથીએ છીએ.",
            facts: ["Kuldevi Worship", "Karma Yoga", "Bhakti Tradition", "Sacred Groves"],
            know: "The main community temple often hosts 'Chovisi' ceremonies where all 32 villages gather for a multi-day spiritual and social festival!",
            image: "/ch-6.webp",
            caption: "A serene temple courtyard, the spiritual heart of a heritage Satvara village."
        },
        {
            id: 7,
            name: "Culture",
            title: "તહેવારો અને સાંસ્કૃતિક જીવન",
            myth: "નવ-રાત્રિ ઉજવણીના ઘટકો:ઘટ-સ્થાપના — ઘરના આંગણે માટીના ઘડા (ગરબો) ની સ્થાપના, નવ-દિવસ સળંગ દીવો ગ્રામ-ગરબા — ગામ-ચૌકમાં ગ્રામ-ઉત્સવ, ૩૦૦-૫૦૦ સ્ત્રી-પુરુષ ભેગા ડાંડિયા-રાસ — ઝૂડ-ઝૂડ ડાંડિયા ના લય-ઘોષ સાથે ભક્તિ-ગીત (ભજન) — જય આઘ-ભવાની, જય અંબે ગૌરી ના ઉદ-ઘોષ અષ્ટ-ભુજા-આઘ-દેવી (કુળ-દેવી) ની ખાસ પૂજા",
            desc: "સત્વારા સમાજ, મુખ્યત્વે હિન્દૂ ધર્મ-પ્રધાન સમુદાય હોવાથી, નવરાત્રિ અને દિવાળી જેવા તહેવારો અત્યંત ઉત્સાહ અને ભક્તિભાવ સાથે ઉજવે છે. નવરાત્રિ દરમિયાન, સમાજના સ્ત્રી-પુરુષ, યુવક-યુવતી ગરબા — દેવી દુર્ગાના સ્તુતિ-ગાનની સાથે ભ્રમણ-નૃત્ય — ખૂબ ઉત્સાહ સાથે કરે છે.નવ-દિવસ ચાલતા આ ઉત્સવ દરમિયાન સત્વારા સમાજ-પ્રદેશ (ઉત્તર ગુજરાત, સૌરાષ્ટ્ર, કચ્છ) ના ગામ-ગામ અને શહેર-શહેરમાં સમૂહ-ગરબાનું આયોજન થાય છે. ગ્રામ-ચૌક અથવા મંદિર-આંગણ માં માટીનો ગરબો ના ફરતે ગોળ-ઘૂમ ગ્રામ-લક્ષ્મી-ઉત્સવ થાય.",
            quote: "આણી સંસ્કૃતિ એ લય છે, જે તમામ બત્રીસ ગામોના હૃદયમાં એકસાથે ધબકે છે.",
            facts: ["Samuh Lagan", "Traditional Garba", "Dandhavya Mela", "Heritage Saffron"],
            know: "The 'Saffron Scarf' worn by our elders during festivals is a specific weave that can only be found in our regional artisanal markets!",
            image: "/ch-7.webp",
            caption: "A vibrant community festival celebrating unity and our shared cultural heritage."
        },
        {
            id: 8,
            name: "Identity",
            title: "આધુનિક ઓળખ",
            myth: "સંગઠિત સમાજ અને યુવા સંગઠનો (Community Networking) આધુનિક યુગમાં 'બત્રીસ ગામ' કે અન્ય વિભાગો વચ્ચેનું અંતર ઘટ્યું છે અને ડિજિટલ માધ્યમોથી સમાજ વધુ નજીક આવ્યો છે. સતવારા સમાજ યુવા સંગઠન: આધુનિક યુવાનો સામાજિક સેવા, બ્લડ ડોનેશન કેમ્પ અને કારકિર્દી માર્ગદર્શન સેમિનાર દ્વારા સમાજને નવી દિશા આપી રહ્યા છે. ડિજિટલ પ્લેટફોર્મ: સમાજની પોતાની એપ્લિકેશન્સ અને ડિજિટલ ડિરેક્ટરીઓ દ્વારા વૈશ્વિક સ્તરે જ્ઞાતિબંધુઓ એકબીજા સાથે જોડાયેલા રહે છે. સ્ત્રી સશક્તિકરણ આધુનિક ઓળખમાં સમાજની દીકરીઓનો ફાળો નોંધપાત્ર છે. શિક્ષણ અને રોજગાર: આજે સમાજની યુવતીઓ ઉચ્ચ અભ્યાસ કરી સરકારી નોકરીઓ, બેન્કિંગ અને બિઝનેસમાં સફળતાપૂર્વક આગળ વધી રહી છે. સામાજિક બદલાવ: જૂની રૂઢિચુસ્ત વિચારધારા ત્યાગીને સમાજ હવે દીકરીઓના સપનાઓને પ્રોત્સાહન આપી રહ્યો છે. સાંસ્કૃતિક ગૌરવની જાળવણી: આધુનિક હોવા છતાં, આ સમાજ પોતાની જડો (Roots) ને ભૂલ્યો નથી. તહેવારોની ઉજવણી: લંડન હોય કે ન્યુયોર્ક, સતવારા સમાજના લોકો આજે પણ નવરાત્રીમાં પરંપરાગત ગરબા અને કુળદેવીની પૂજા તેટલી જ શ્રદ્ધાથી કરે છે. પરંપરાગત મૂલ્યો: સત્ય અને પ્રામાણિકતા જે પૂર્વજોનો વારસો હતો, તેને આધુનિક બિઝનેસ અને પ્રોફેશનલ લાઈફમાં પણ જાળવી રાખ્યો છે.",
            desc: "શૈક્ષણિક ક્રાંતિ (Educational Advancement) જે સમાજ ક્યારેક માત્ર ખેતી અને હસ્તકલા સુધી મર્યાદિત હતો, તે આજે શિક્ષણને સર્વોપરી માને છે. વૈવિધ્યપૂર્ણ કારકિર્દી: આજે સમાજના યુવાનો માત્ર સિવિલ એન્જિનિયરિંગ જ નહીં, પરંતુ IT, મેડિકલ, ડેટા સાયન્સ, અને આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI) જેવા ક્ષેત્રોમાં પણ આગળ વધી રહ્યા છે. વિદેશ ગમન: ઉચ્ચ શિક્ષણ માટે સમાજના યુવાનો અમેરિકા, કેનેડા અને યુરોપ જેવા દેશોમાં જઈને પોતાની કાબેલિયત સાબિત કરી રહ્યા છે. સ્થાપત્યથી એન્જિનિયરિંગ સુધીની સફર: કડિયા સમાજનું પરંપરાગત જ્ઞાન હવે આધુનિક ટેકનોલોજી સાથે જોડાયું છે. રીઅલ એસ્ટેટ અને ઈન્ફ્રાસ્ટ્રક્ચર: આજે ઘણા સતવારા-કડિયા પરિવારો મોટા ગજાના બિલ્ડરો, આર્કિટેક્ટ્સ અને કોન્ટ્રાક્ટર્સ તરીકે ઉભરી આવ્યા છે. જે નમ્ર શરૂઆત પથ્થર કંડારવાથી થઈ હતી, તે આજે આધુનિક ગગનચુંબી ઈમારતોના નિર્માણ સુધી પહોંચી છે.",
            quote: "આપણી જડો આપણા વારસાની ભૂમિમાં ઊંડે સુધી પ્રસરેલી છે, પરંતુ આપણી શાખાઓ ડિજિટલ યુગના તારલાઓને સ્પર્શવા વિસ્તરી રહી છે.",
            facts: ["Global Diaspora", "Digital Renaissance", "Educational Mandala", "Architects 2.0"],
            know: "This digital platform was designed to bridge the gap between 32 villages and over 500,000 members worldwide!",
            image: "/ch-8.webp",
            caption: "The digital evolution of our community: Connecting our global heritage in real-time."
        }
    ];

    useEffect(() => {
        // Scroll Progress Listener
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = (window.scrollY / totalScroll) * 100;
            setScrollProgress(currentProgress);
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for Scroll Animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        entry.target.classList.remove('opacity-0', 'translate-y-8');
                    }
                });
            },
            { threshold: 0.1 }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            sectionRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(`chapter-${id}`);
        if (element) {
            // Offset for the two sticky navbars (Main Nav 64px + History Nav ~60px)
            const offset = 124;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-[#FFF8F0] min-h-screen font-sans selection:bg-[#C8410B] selection:text-white">

            {/* Scroll Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-[#C8410B] z-100 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* Hero Section */}
            <section
                className="relative h-[50vh] flex items-center justify-center bg-fixed bg-center bg-cover"
                style={{ backgroundImage: 'url("/bg-sat.webp")' }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                <div className="relative text-center px-4 max-w-4xl">
                    <h1 className="text-5xl font-gujarati md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                        આપણો <span className="text-[#F5A623]">પથ્થરમાં</span> વારસો
                    </h1>
                    <p className="text-2xl font-gujarati md:text-2xl text-gray-200 font-medium tracking-wide">
                        સતવારા સમુદાયનો અસંખ્ય ઇતિહાસ: દૈવી સ્થાપત્યથી ડિજિટલ નવીનતા સુધી
                    </p>
                </div>
            </section>

            {/* Sticky Navigation - Now Below Main Navbar */}
            <nav className="sticky top-16 bg-white/90 backdrop-blur-md border-b border-[#C8410B]/20 py-4 px-6 z-40 overflow-x-auto">
                <div className="max-w-7xl mx-auto flex items-center md:justify-center gap-6 md:gap-12 whitespace-nowrap scrollbar-hide">
                    {chapters.map((chap) => (
                        <button
                            key={chap.id}
                            onClick={() => scrollToSection(chap.id)}
                            className="text-sm font-bold text-[#4A2800]/70 hover:text-[#C8410B] transition-colors flex items-center gap-2 group"
                        >
                            <span className="w-6 h-6 rounded-full bg-[#C8410B]/10 flex items-center justify-center text-[10px] group-hover:bg-[#C8410B] group-hover:text-white transition-all">
                                {chap.id}
                            </span>
                            {chap.name}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Chapter Sections */}
            <main className="max-w-7xl mx-auto px-6 py-20 overflow-hidden">
                {chapters.map((chap, index) => (
                    <section
                        id={`chapter-${chap.id}`}
                        key={chap.id}
                        ref={(el) => (sectionRefs.current[index] = el)}
                        className="mb-32 opacity-0 translate-y-8 transition-all duration-1000 ease-out scroll-mt-32"
                    >
                        {/* Layout Box */}
                        <div className={`flex flex-col lg:gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>

                            {/* Image Column */}
                            <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
                                <div className="relative group">
                                    <img
                                        src={chap.image}
                                        alt={chap.title}
                                        width={800}
                                        height={500}
                                        className="rounded-2xl shadow-2xl object-cover w-full h-100 lg:h-[650px] transition-transform duration-500 hover:scale-[1.03]"
                                    />
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                                </div>
                                <p className="text-sm text-gray-500 italic mt-3 pl-2 border-l-2 border-[#C8410B]/30">
                                    {chap.caption}
                                </p>
                            </div>

                            {/* Text Column */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[#C8410B] text-white font-bold flex items-center justify-center text-xl shadow-lg ring-4 ring-[#C8410B]/20">
                                        {chap.id}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-[#4A2800] border-l-4 border-[#C8410B] pl-4 uppercase tracking-tighter">
                                        {chap.title}
                                    </h2>
                                </div>

                                <div className="space-y-6 text-gray-800 leading-relaxed text-justify">
                                    <p>{chap.desc}</p>

                                    <blockquote className="text-2xl italic text-[#C8410B] border-l-4 border-[#C8410B] p-4 bg-[#C8410B]/5 rounded-r-2xl font-serif">
                                        "{chap.quote}"
                                    </blockquote>

                                    <p>{chap.myth}</p>
                                </div>

                                {/* Key Facts Badges */}
                                <div className="flex flex-wrap gap-2 mt-8">
                                    {chap.facts.map((fact, i) => (
                                        <span
                                            key={i}
                                            className="rounded-full bg-[#F5A623]/20 text-[#4A2800] px-4 py-1.5 text-xs font-bold uppercase tracking-widest border border-[#F5A623]/40"
                                        >
                                            {fact}
                                        </span>
                                    ))}
                                </div>

                                {/* Did You Know? */}
                                <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-2xl p-6 mt-8 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#F5A623]/20 rounded-full blur-2xl group-hover:bg-[#F5A623]/30 transition-colors" />
                                    <h4 className="text-sm font-black text-[#C8410B] uppercase flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4" /> Did You Know?
                                    </h4>
                                    <p className="text-sm text-[#4A2800] relative z-10 leading-relaxed italic">
                                        {chap.know}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </main>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-[#C8410B] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-2 z-90 active:scale-95 group"
                >
                    <ChevronUp className="w-7 h-7 group-hover:animate-bounce" />
                </button>
            )}
            <Footer />
        </div>
    );
};

export default History;
