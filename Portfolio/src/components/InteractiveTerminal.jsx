import { useState, useRef, useEffect } from 'react';
import SpecularButton from './SpecularButton';
import './InteractiveTerminal.css';

const WELCOME_MESSAGES = [
  { type: 'system', text: 'Flash OS [Version 2.4.0 (x86_64-linux)]' },
  { type: 'system', text: 'Type "help" to view available commands.' },
  { type: 'info', text: 'Try typing: email, skills, or clear' },
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
          { type: 'help-item', cmd: 'skills', desc: 'Display engineering stack & technologies' },
          { type: 'help-item', cmd: 'about', desc: 'Short bio about FlashDev' },
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

      case 'about':
      case 'bio':
        responseEntries = [
          { type: 'output', text: '👨‍💻 FLASHDEV - Full Stack Software Engineer' },
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
    <SpecularButton
      as="div"
      className="contact-specular-bezel terminal-specular-bezel"
      radius={28}
      tint="#0d0e14"
      tintOpacity={1}
      blur={0}
      lineColor="#ffffff"
      baseColor="#2d3039"
      intensity={1.1}
      shineSize={14}
      shineFade={50}
      thickness={1.5}
      speed={0.35}
      followMouse={true}
      proximity={400}
      autoAnimate={false}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-card-inner">
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
      <div className="terminal-body" ref={terminalBodyRef} data-lenis-prevent="true">
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
          if (item.type === 'skill-row') {
            return (
              <div key={idx} className="term-skill-line">
                <span className="term-skill-cat">{item.cat}:</span>
                <span className="term-skill-items">{item.items}</span>
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
            placeholder="type command (e.g. email, skills, help)..."
          />
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="terminal-chips-bar" onClick={(e) => e.stopPropagation()}>
        <span className="chips-label">Quick cmds:</span>
        {['email', 'skills', 'help', 'clear'].map((cmd) => (
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
    </SpecularButton>
  );
}
