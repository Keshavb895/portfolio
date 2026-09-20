import { useState, useRef, useEffect } from 'react';
import './InteractiveTerminal.css';

const WELCOME_MESSAGES = [
  { type: 'system', text: 'Flash OS [Version 2.4.0 (x86_64-linux)]' },
  { type: 'system', text: 'Type "help" to view available commands.' },
  { type: 'info', text: 'Try typing: email, projects, skills, socials, or clear' },
];

export default function InteractiveTerminal() {
  const [history, setHistory] = useState(WELCOME_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);

  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll terminal to bottom whenever history updates
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('keshavb895@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCommand = (rawCmd) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    // Add user input entry
    const newEntry = { type: 'command', text: rawCmd };
    let responseEntries = [];

    switch (cmd) {
      case 'help':
      case 'commands':
      case '?':
        responseEntries = [
          { type: 'output', text: 'AVAILABLE COMMANDS:' },
          { type: 'help-item', cmd: 'email', desc: 'Get direct email & copy action' },
          { type: 'help-item', cmd: 'projects', desc: 'Browse featured project highlights' },
          { type: 'help-item', cmd: 'skills', desc: 'Display engineering stack & technologies' },
          { type: 'help-item', cmd: 'socials', desc: 'Display links to GitHub, LinkedIn, Twitter' },
          { type: 'help-item', cmd: 'about', desc: 'Short bio about Keshav' },
          { type: 'help-item', cmd: 'contact', desc: 'Send a message via the form on the right' },
          { type: 'help-item', cmd: 'clear', desc: 'Clear the terminal output' },
          { type: 'help-item', cmd: 'whoami', desc: 'Show current active session' },
        ];
        break;

      case 'email':
      case 'mail':
        responseEntries = [
          {
            type: 'email-card',
            email: 'keshavb895@gmail.com',
          },
        ];
        break;

      case 'projects':
      case 'project':
      case 'work':
        responseEntries = [
          { type: 'output', text: '🚀 FEATURED PROJECTS:' },
          { type: 'project-item', title: '1. 3D Interactive Portfolio', desc: 'WebGL Topography, custom fluid physics, kinetic typography & Lenis momentum scroll.' },
          { type: 'project-item', title: '2. Full-Stack Web Platform', desc: 'React, Node.js, Express & MongoDB with modern JWT auth and cloud storage.' },
          { type: 'project-item', title: '3. Distributed Microservices', desc: 'High-throughput APIs, Docker containers, CI/CD automated pipeline.' },
          { type: 'info', text: '💡 Scroll up to the Projects section to explore interactive previews.' },
        ];
        break;

      case 'skills':
      case 'skill':
      case 'tech':
      case 'stack':
        responseEntries = [
          { type: 'output', text: '⚡ TECHNICAL STACK:' },
          { type: 'skill-row', cat: 'Frontend', items: 'React, Next.js, JavaScript (ES6+), CSS/HTML5, WebGL' },
          { type: 'skill-row', cat: 'Backend', items: 'Node.js, Express, RESTful APIs, GraphQL' },
          { type: 'skill-row', cat: 'Databases', items: 'MongoDB, PostgreSQL, Redis' },
          { type: 'skill-row', cat: 'DevOps/Tools', items: 'Docker, Git, CI/CD, Linux, Postman' },
        ];
        break;

      case 'socials':
      case 'social':
      case 'links':
      case 'github':
      case 'linkedin':
      case 'twitter':
        responseEntries = [
          { type: 'output', text: '🌐 SOCIAL & DEVELOPER PROFILES:' },
          {
            type: 'social-links',
            links: [
              { name: 'GitHub', url: 'https://github.com/Keshavb895' },
              { name: 'LinkedIn', url: 'https://linkedin.com' },
              { name: 'Twitter', url: 'https://twitter.com' },
            ],
          },
        ];
        break;

      case 'about':
      case 'bio':
        responseEntries = [
          { type: 'output', text: '👨‍💻 KESHAV - Full Stack Software Engineer' },
          { type: 'text', text: 'Crafting performant web experiences, elegant system architectures, and visually compelling digital products.' },
          { type: 'info', text: 'Status: 🟢 Available for new full-stack opportunities and ambitious projects.' },
        ];
        break;

      case 'contact':
        responseEntries = [
          { type: 'output', text: '✉️ Direct Contact:' },
          { type: 'text', text: 'Use the interactive form right next to this terminal to send a message directly!' },
        ];
        break;

      case 'whoami':
        responseEntries = [
          { type: 'output', text: 'visitor@portfolio (Guest Developer, Permissions: Read-Only)' },
        ];
        break;

      case 'sudo':
        responseEntries = [
          { type: 'error', text: 'sudo: Permission denied. Nice try! 😉' },
        ];
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      default:
        responseEntries = [
          {
            type: 'error',
            text: `bash: command not found: "${cmd}". Type "help" to see available commands.`,
          },
        ];
        break;
    }

    setHistory((prev) => [...prev, newEntry, ...responseEntries]);
    setCmdHistory((prev) => [rawCmd, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleQuickCommand = (cmd) => {
    executeCommand(cmd);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="terminal-card-bezel" onClick={() => inputRef.current?.focus()}>
      {/* Terminal Window Top Bar */}
      <div className="terminal-header">
        <div className="terminal-controls">
          <span className="term-dot term-close" />
          <span className="term-dot term-minimize" />
          <span className="term-dot term-zoom" />
        </div>
        <div className="terminal-title">
          <svg className="term-shell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span>flash@portfolio: ~ (zsh)</span>
        </div>
        <div className="terminal-status-badge">
          <span className="term-pulse-dot" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* Terminal Output & History */}
      <div className="terminal-body" ref={terminalBodyRef}>
        {history.map((item, idx) => {
          if (item.type === 'system') {
            return <div key={idx} className="term-line term-system">{item.text}</div>;
          }
          if (item.type === 'info') {
            return <div key={idx} className="term-line term-info">{item.text}</div>;
          }
          if (item.type === 'command') {
            return (
              <div key={idx} className="term-line term-cmd-echo">
                <span className="term-prompt-prefix">flash@portfolio:~$</span>
                <span className="term-cmd-text">{item.text}</span>
              </div>
            );
          }
          if (item.type === 'output' || item.type === 'text') {
            return <div key={idx} className="term-line term-output">{item.text}</div>;
          }
          if (item.type === 'error') {
            return <div key={idx} className="term-line term-error">{item.text}</div>;
          }
          if (item.type === 'help-item') {
            return (
              <div key={idx} className="term-help-line">
                <span className="term-help-cmd" onClick={(e) => { e.stopPropagation(); handleQuickCommand(item.cmd); }}>
                  {item.cmd}
                </span>
                <span className="term-help-desc">— {item.desc}</span>
              </div>
            );
          }
          if (item.type === 'email-card') {
            return (
              <div key={idx} className="term-email-card" onClick={(e) => e.stopPropagation()}>
                <div className="term-email-info">
                  <span className="term-label">DIRECT EMAIL:</span>
                  <a href={`mailto:${item.email}`} className="term-email-link">{item.email}</a>
                </div>
                <button
                  type="button"
                  className="term-copy-btn"
                  onClick={handleCopyEmail}
                >
                  {copied ? '✓ Copied!' : 'Copy Email'}
                </button>
              </div>
            );
          }
          if (item.type === 'project-item') {
            return (
              <div key={idx} className="term-project-row">
                <span className="term-project-title">{item.title}</span>
                <span className="term-project-desc">{item.desc}</span>
              </div>
            );
          }
          if (item.type === 'skill-row') {
            return (
              <div key={idx} className="term-skill-line">
                <span className="term-skill-cat">{item.cat}:</span>
                <span className="term-skill-items">{item.items}</span>
              </div>
            );
          }
          if (item.type === 'social-links') {
            return (
              <div key={idx} className="term-social-row" onClick={(e) => e.stopPropagation()}>
                {item.links.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="term-social-pill"
                  >
                    <span>{link.name}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="term-link-icon">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                ))}
              </div>
            );
          }
          return null;
        })}

        {/* Active Command Input Line */}
        <div className="terminal-input-row">
          <span className="term-prompt-prefix">flash@portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            placeholder="type command (e.g. email, projects, help)..."
          />
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="terminal-chips-bar" onClick={(e) => e.stopPropagation()}>
        <span className="chips-label">Quick cmds:</span>
        {['email', 'projects', 'skills', 'socials', 'help', 'clear'].map((cmd) => (
          <button
            key={cmd}
            type="button"
            className="terminal-chip"
            onClick={() => handleQuickCommand(cmd)}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
