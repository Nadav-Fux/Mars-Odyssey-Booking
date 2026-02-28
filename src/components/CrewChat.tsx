import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';

/* ================================================================
   CREW CHAT

   Interactive chat with ARES-X crew members.
   - Uses Groq LLM via Edge Function when Supabase is available
   - Falls back to rich offline scripted conversations
   - 4 selectable crew members with unique personalities
   - Typing indicator with signal delay flavor
   - Auto-scroll to latest message
   - Themed UI matching the ARES-X aesthetic
   ================================================================ */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CREW = [
{ id: 'vasquez', name: 'Dr. Elena Vasquez', role: 'Chief Science Officer', color: '#FF4500', initials: 'EV' },
{ id: 'chen', name: 'Cmdr. James Chen', role: 'Mission Commander', color: '#eab308', initials: 'JC' },
{ id: 'patel', name: 'Aisha Patel', role: 'Flight Engineer', color: '#4ab8c4', initials: 'AP' },
{ id: 'torres', name: 'Prof. Marco Torres', role: 'Geologist', color: '#a855f7', initials: 'MT' }] as
const;

type CrewId = typeof CREW[number]['id'];

/* ── Offline response engine ── */
const OFFLINE_RESPONSES: Record<string, string[][]> = {
  vasquez: [
  ['hello|hi|hey|greet', 'Hey! Great to hear from you. I just finished running spectral analysis on our latest rock samples. The iron oxide signatures here are incredible.'],
  ['mars|planet|red', 'Mars is even more breathtaking in person. The sky at dawn has this subtle pink-gold gradient that no photograph has ever captured properly.'],
  ['science|research|study|experiment', 'We\'re running over 40 active experiments right now. The astrobiology suite is my baby \u2014 we\'re analyzing subsurface water samples for potential biosignatures.'],
  ['water|ice|life', 'The subsurface ice deposits are massive \u2014 we\'re talking meters thick in some areas. And where there\'s water, there\'s hope for past or present microbial life.'],
  ['danger|risk|safe', 'Radiation is our biggest concern. The regolith shielding in the hab works well, but EVAs require careful dosimeter monitoring. We limit surface time to 4 hours per sortie.'],
  ['food|eat|cook', 'The hydroponic garden is thriving! We\'re growing lettuce, tomatoes, and even some strawberries. Fresh food does wonders for morale \u2014 freeze-dried gets old fast.'],
  ['home|earth|miss', 'I miss the ocean. The sound of waves, the salt air\u2026 Sometimes I close my eyes in the hab and pretend the air recycler humming is the tide. But I wouldn\'t trade this for anything.'],
  ['weather|storm|dust', 'Dust storms are no joke. Last month we had a regional storm that cut solar input by 60%. We switched to the backup nuclear generator. It was tense but manageable.'],
  ['sunset|sun|sky|night', 'Sunsets on Mars are blue! The fine Martian dust scatters the short wavelengths. It\'s the opposite of Earth. Absolutely hauntingly beautiful.'],
  ['team|crew|together', 'This crew is the best I\'ve ever worked with. Chen keeps us disciplined, Patel keeps the machines running, Torres finds the most amazing geological specimens. We\'re a family now.']],

  chen: [
  ['hello|hi|hey|greet', 'Commander Chen here. Reading you five by five. How can I assist?'],
  ['mission|objective|goal|plan', 'Primary objective: establish sustainable human presence on Mars. We\'re 847 sols in and on track. Phase 2 construction begins next month \u2014 expanding the greenhouse module.'],
  ['leader|command|decision', 'Leadership out here is different from Earth. There\'s no "chain of command" in the traditional sense \u2014 we\'re four people who trust each other with our lives. Every day.'],
  ['danger|risk|emergency', 'We train for every contingency. Depressurization, medical emergencies, dust storms, equipment failure. The key is staying calm and following procedure. Panic kills faster than any hazard.'],
  ['earth|home|family', 'My daughter turned 8 last week. Earth time. I recorded a birthday message and sent it \u2014 14-minute delay each way. She sent back a drawing of me on Mars with a big red sky. It\'s taped to my bunk.'],
  ['ship|travel|journey', 'The transit took 7 months. Hardest part wasn\'t the cramped quarters \u2014 it was watching Earth shrink to a dot. That moment changes you. You realize how precious that blue marble is.'],
  ['schedule|routine|day', 'We wake at 0600 Mars time. Physical training, breakfast, then EVA or lab work until 1800. Evenings are for reports, personal time, and occasionally a movie night. Structure keeps us sane.'],
  ['mars|surface|explore', 'Every EVA feels like the first. You step outside and the silence hits you \u2014 absolute silence except your own breathing. Then you see the horizon curving away and remember: you\'re on another world.'],
  ['return|back|when', 'Return window opens in 14 months. But honestly? Part of me wants to stay. There\'s so much more to explore. The next crew will continue our work, but there\'s nothing like being first.'],
  ['team|crew|people', 'I\'d go into combat with this crew. Vasquez is brilliant, Torres has an eye for discovery that borders on supernatural, and Patel \u2014 well, Patel could fix a nuclear reactor with a paperclip.']],

  patel: [
  ['hello|hi|hey|greet', 'Patel here! Just finished a maintenance run on the solar arrays. What\'s up?'],
  ['engineer|fix|repair|build', 'Everything breaks out here eventually. The key is redundancy and improvisation. I\'ve 3D-printed more spare parts than I can count. The printer is basically my best friend.'],
  ['rover|biscuit|vehicle', 'Biscuit \u2014 that\'s our rover \u2014 is an absolute workhorse. She\'s done over 2,000 km on Martian terrain. I keep her running with love, WD-40, and occasionally some very creative wiring.'],
  ['power|energy|solar|nuclear', 'We run a hybrid system: solar panels for daytime, MMRTG nuclear generator for backup and nighttime. During dust storms, the nuke is our lifeline. It\'s reliable but we have to watch the thermals.'],
  ['habitat|hab|home|live', 'The hab is surprisingly cozy once you get used to it. I\'ve rigged up ambient lighting that simulates Earth daylight cycles. Helps with the circadian rhythm. Little things make a big difference.'],
  ['oxygen|air|breathe', 'MOXIE 2.0 converts Martian CO2 into breathable oxygen. I babysit that system like my life depends on it \u2014 because it literally does. It\'s running at 98.7% efficiency right now.'],
  ['communication|signal|talk', 'Signal delay to Earth is between 4 and 24 minutes depending on orbital positions. We can\'t have real-time conversations \u2014 everything is basically fancy voicemail. You get used to it.'],
  ['problem|challenge|hard', 'Biggest engineering challenge? Dust. It gets into everything. Seals, joints, solar cells, air filters. I spend about 30% of my maintenance time just dealing with Martian dust infiltration.'],
  ['favorite|fun|enjoy', 'Best part of the job? Watching a system I designed work perfectly in an environment it was never meant for. Second best? Zero-delay ping pong in the rec module. Torres owes me 47 games.'],
  ['future|plan|next', 'I\'m drafting plans for a pressurized garage so we can do rover maintenance without suits. If the next supply drop includes the extra panels I requested, we\'ll have it running in 3 months.']],

  torres: [
  ['hello|hi|hey|greet', 'Ah, hello my friend! Professor Torres at your service. I was just examining the most exquisite layered sedimentary formation. What brings you to Mars?'],
  ['rock|geology|mineral|stone', 'Every rock here tells a story spanning billions of years. Yesterday I found hematite concretions \u2014 "blueberries" we call them. They only form in the presence of water. Evidence of ancient Mars.'],
  ['life|fossil|biology|ancient', 'Have we found life? Not definitively. But the organic molecules in the Jezero delta sediments are\u2026 suggestive. I remain cautiously optimistic. Science demands patience.'],
  ['history|past|old|time', 'Mars was once a warm, wet world with rivers and lakes. What happened? The magnetic field collapsed, the atmosphere stripped away. A cautionary tale for any civilization, really.'],
  ['earth|compare|different', 'Earth and Mars are siblings who grew up in very different circumstances. Same building blocks, vastly different outcomes. Studying Mars helps us understand what makes Earth special.'],
  ['cave|underground|lava', 'The lava tubes here are enormous \u2014 some large enough to fit buildings inside. They offer natural radiation shielding. I believe our future cities will be underground, in these tubes.'],
  ['olympus|volcano|mountain', 'Olympus Mons makes Everest look like a speed bump. 21.9 kilometers tall. The caldera is so large that if you stood inside it, you couldn\'t see the walls \u2014 they\'d be beyond the horizon.'],
  ['philosophy|think|wonder|sagan', 'As Sagan said, we are a way for the cosmos to know itself. Standing on Mars, touching rocks formed 4 billion years ago\u2026 I feel that deeply. We are the universe examining itself.'],
  ['discover|find|explore', 'The Valles Marineris canyon system stretches 4,000 km \u2014 longer than the United States is wide. We\'ve barely explored 1% of it. A lifetime of discoveries awaits.'],
  ['beautiful|amazing|wonder', 'The beauty of Mars is subtle. It\'s not the lush green of Earth. It\'s the austere majesty of deep time laid bare. Iron oxide deserts stretching to infinity under a butterscotch sky. Sublime.']]

};

const GENERIC_RESPONSES: Record<string, string[]> = {
  vasquez: [
  'That\'s a great question. Let me think about it from a scientific perspective\u2026 The data we\'re collecting could shed light on that.',
  'Interesting point! You know, we actually discussed something similar during last night\'s crew dinner. Space makes you think about things differently.',
  'I\'d love to explore that more. Out here, every observation raises ten new questions. That\'s what makes this mission so exciting.'],

  chen: [
  'Good question. Let me give you the straight answer as your mission commander: we\'re learning something new every single sol.',
  'Roger that. You know, perspective changes everything out here. What seems impossible on Earth becomes Tuesday on Mars.',
  'Acknowledged. I\'ll add that to the mission debrief. Communication with Earth support is always valuable.'],

  patel: [
  'Ha, that reminds me of a problem I had to solve last week with the thermal regulators. Everything connects to everything out here!',
  'Good one! You know, if I had a spare part for every interesting question, I\'d have Biscuit 2.0 built by now.',
  'That\'s the kind of thinking we need more of. Engineering is about asking the right questions, not just finding answers.'],

  torres: [
  'Ah, what a wonderful thought. You know, the ancient Romans looked at Mars and called it the god of war. Now we walk on it seeking peace and knowledge.',
  'That reminds me of something beautiful. The layers of sediment here are like pages in a book \u2014 each one a chapter of Mars\u2019 story.',
  'How poetic. You would make a fine member of our crew. The universe rewards the curious mind.']

};

function findOfflineResponse(crewId: string, userText: string): string {
  const lower = userText.toLowerCase();
  const patterns = OFFLINE_RESPONSES[crewId] || [];

  for (const [keywords, response] of patterns) {
    const keywordList = keywords.split('|');
    if (keywordList.some((kw) => lower.includes(kw))) {
      return response;
    }
  }

  // Generic fallback
  const generics = GENERIC_RESPONSES[crewId] || GENERIC_RESPONSES['vasquez'];
  return generics[Math.floor(Math.random() * generics.length)];
}

export default function CrewChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewId>('vasquez');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrewPicker, setShowCrewPicker] = useState(false);
  const [chattedWith, setChattedWith] = useState<Set<string>>(new Set());
  const [useOnline, setUseOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { unlock } = useAchievements();
  const { logEvent } = useMissionLog();

  const crew = CREW.find((c) => c.id === selectedCrew)!;

  // Check if online mode is available
  useEffect(() => {
    setUseOnline(!!supabase);
  }, []);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;
    const element = containerRef.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Welcome message when crew changes
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: getWelcome(selectedCrew),
      timestamp: new Date()
    }]);
  }, [selectedCrew]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Unlock achievements
    unlock('crew_chat');
    setChattedWith((prev) => {
      const next = new Set(prev);
      next.add(selectedCrew);
      if (next.size >= 4) unlock('all_crew');
      return next;
    });

    logEvent(`Contacted crew member: ${crew.name}`);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let reply: string;

      if (useOnline && supabase) {
        // Try online AI response
        const chatHistory = [...messages.filter((m) => m.id !== 'welcome'), userMsg].
        map(({ role, content }) => ({ role, content }));

        const { data, error } = await supabase.functions.invoke('crew-chat', {
          body: { messages: chatHistory, crewMember: selectedCrew }
        });

        if (error) throw error;
        reply = data.reply || findOfflineResponse(selectedCrew, text);
      } else {
        // Offline mode: simulate signal delay
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 1500));
        reply = findOfflineResponse(selectedCrew, text);
      }

      setMessages((prev) => [...prev, {
        id: `crew-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);
    } catch {
      // Fallback to offline on error
      await new Promise((r) => setTimeout(r, 500));
      const reply = findOfflineResponse(selectedCrew, text);
      setMessages((prev) => [...prev, {
        id: `crew-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedCrew, useOnline, unlock, logEvent, crew.name]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed z-[160] w-11 h-11 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all group
          bottom-24 left-5 lg:bottom-32 lg:left-7"
        style={{
          backgroundColor: isOpen ? `${crew.color}15` : 'rgba(255,255,255,0.04)',
          borderColor: isOpen ? `${crew.color}30` : 'rgba(255,255,255,0.08)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Chat with Mars Crew">

        <MessageCircle className="w-4.5 h-4.5 transition-colors" style={{ color: isOpen ? crew.color : 'rgba(255,255,255,0.3)' }} />
        {!isOpen &&
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: crew.color }} />
        }
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          className="fixed z-[160] rounded-2xl bg-[#0a0a12]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col
            left-3 right-3 bottom-[7rem]
            lg:left-[4.5rem] lg:right-auto lg:bottom-32 lg:w-[400px]"
          style={{ maxHeight: 'min(65vh, 520px)' }}>

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${crew.color}, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
              <button
            onClick={() => setShowCrewPicker((v) => !v)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">

                <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-display font-bold"
              style={{ backgroundColor: crew.color + '20', color: crew.color, border: `1px solid ${crew.color}30` }}>

                  {crew.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-display tracking-wider text-white/50 font-medium">{crew.name}</span>
                    <ChevronDown className="w-3 h-3 text-white/50" />
                  </div>
                  <div className="text-[7px] font-display tracking-[0.15em] text-white/50">{crew.role}</div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: useOnline ? '#22c55e' : crew.color }} />
                  <span className="text-[7px] font-display tracking-[0.15em] text-white/50">
                    {useOnline ? 'AI LIVE' : 'LOCAL'}
                  </span>
                </div>
                <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors">

                  <X className="w-3 h-3 text-white/30" />
                </button>
              </div>
            </div>

            {/* Crew picker dropdown */}
            <AnimatePresence>
              {showCrewPicker &&
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-white/[0.06] overflow-hidden shrink-0">

                  <div className="p-2 grid grid-cols-2 gap-1.5">
                    {CREW.map((c) =>
                <button
                key={c.id}
                onClick={() => {setSelectedCrew(c.id);setShowCrewPicker(false);}}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-left ${
                selectedCrew === c.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`
                }>

                        <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-display font-bold shrink-0"
                  style={{ backgroundColor: c.color + '20', color: c.color }}>

                          {c.initials}
                        </div>
                        <div>
                          <div className="text-[9px] text-white/40 font-medium leading-tight">{c.name.split(' ').slice(-1)}</div>
                          <div className="text-[7px] text-white/50">{c.role}</div>
                        </div>
                      </button>
                )}
                  </div>
                </motion.div>
            }
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg) =>
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'assistant' &&
              <div className="flex items-center gap-1.5 mb-1">
                      <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-display font-bold"
                style={{ backgroundColor: crew.color + '20', color: crew.color }}>

                        {crew.initials}
                      </div>
                      <span className="text-[7px] font-display tracking-wider" style={{ color: crew.color + '60' }}>
                        {crew.name.split(' ').slice(-1)[0].toUpperCase()}
                      </span>
                    </div>
              }
                  <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] sm:text-xs leading-relaxed ${
              msg.role === 'user' ?
              'bg-white/[0.06] border border-white/[0.08] text-white/50 rounded-tr-sm' :
              'rounded-tl-sm text-white/40'}`
              }
              style={
              msg.role === 'assistant' ?
              { backgroundColor: crew.color + '08', borderWidth: 1, borderColor: crew.color + '15' } :
              undefined
              }>

                    {msg.content}
                  </div>
                </div>
            )}

              {/* Typing indicator */}
              {isLoading &&
            <div className="flex items-start gap-2">
                  <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-display font-bold"
              style={{ backgroundColor: crew.color + '20', color: crew.color }}>

                    {crew.initials}
                  </div>
                  <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: crew.color + '08', borderWidth: 1, borderColor: crew.color + '15' }}>

                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: crew.color + '60' }} />
                    <span className="text-[9px] font-display tracking-wider" style={{ color: crew.color + '40' }}>TRANSMITTING...</span>
                  </div>
                </div>
            }
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 py-2.5 border-t border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${crew.name.split(' ').slice(-1)[0]}...`}
              disabled={isLoading}
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/50 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors disabled:opacity-40" />

                <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
              style={{ backgroundColor: crew.color + '15', border: `1px solid ${crew.color}25` }}>

                  <Send className="w-3.5 h-3.5" style={{ color: crew.color }} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[6px] font-display tracking-[0.15em] text-white/10">
                  SIGNAL DELAY: 14m 22s \u00b7 ENCRYPTED
                </span>
                <span className="text-[6px] font-display tracking-[0.15em] text-white/10">
                  {useOnline ? 'GROQ \u00b7 LLAMA 3.3' : 'LOCAL RELAY \u00b7 CACHED'}
                </span>
              </div>
            </div>

            {/* Scanlines */}
            <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.004) 3px, rgba(255,255,255,0.004) 4px)'
          }} />

          </motion.div>
        }
      </AnimatePresence>
    </>);

}

function getWelcome(crewId: string): string {
  switch (crewId) {
    case 'vasquez':
      return 'Hey there, Earth! Dr. Vasquez here. Just got back from sample collection at the delta. The sunset was incredible today \u2014 blue and pink at the horizon. What\u2019s on your mind?';
    case 'chen':
      return 'This is Commander Chen. Reading you loud and clear. All systems nominal up here. What can I help you with?';
    case 'patel':
      return 'Patel here! Just finished calibrating Biscuit\u2019s nav sensors \u2014 she\u2019s ready for tomorrow\u2019s run. Fire away, what do you want to know?';
    case 'torres':
      return 'Ah, hello! Professor Torres speaking. I\u2019m sitting in the hab looking at the most extraordinary rock samples. As Sagan said, we are a way for the cosmos to know itself. How can I help?';
    default:
      return 'ARES-X crew online. Go ahead.';
  }
}
