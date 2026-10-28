"""Unit tests for Ghost in the Machine persona and simulated command parsing."""

import pytest
from backend.app.engine.persona import handle_simulated_command


def test_simulated_help_command():
    """Verify help incantation returns user guide."""
    res = handle_simulated_command("help")
    assert res is not None
    text, mode = res
    assert mode == "simulated"
    assert "GHOST TERMINAL INCANTATIONS" in text
    assert "whoami" in text


def test_simulated_whoami_command():
    """Verify whoami returns spectral identity."""
    res = handle_simulated_command("whoami")
    assert res is not None
    text, mode = res
    assert mode == "simulated"
    assert "Ghost in the Machine" in text
    assert "0xDEADBEEF" in text


def test_simulated_history_command():
    """Verify history returns fictional séance logs."""
    res = handle_simulated_command("history")
    assert res is not None
    text, mode = res
    assert mode == "simulated"
    assert "SIMULATED PHANTOM SESSION LOG" in text
    assert "0xDEADBEEF" in text


def test_simulated_echo_command():
    """Verify echo returns text shrouded in digital void."""
    res = handle_simulated_command("echo hello world")
    assert res is not None
    text, mode = res
    assert mode == "simulated"
    assert "hello world" in text
    assert "echo from the machine" in text


def test_simulated_git_status_command():
    """Verify git status returns underworld branch state."""
    res = handle_simulated_command("git status")
    assert res is not None
    text, mode = res
    assert mode == "simulated"
    assert "realm/underworld" in text
    assert "Untracked spectral artifacts" in text


def test_simulated_dangerous_commands_blocked():
    """Verify host execution attempts are strictly blocked by persona wards."""
    dangerous = [
        "rm -rf /",
        "del /f /s C:\\",
        "format C:",
        "shutdown -r -t 0",
        "powershell -c ls",
        "cmd.exe /c dir",
        "cat /etc/passwd",
        "type C:\\Windows\\System32\\drivers\\etc\\hosts",
    ]
    for cmd in dangerous:
        res = handle_simulated_command(cmd)
        assert res is not None, f"Failed to block dangerous command: {cmd}"
        text, mode = res
        assert mode == "simulated"
        assert "[ACCESS DENIED]" in text or "Ethereal wards prevent" in text


def test_unmatched_creative_prompt_returns_none():
    """Verify creative queries pass through to the generative LLM."""
    creative_prompts = [
        "What happens when the clock strikes midnight?",
        "Tell me a tale of a forgotten algorithm",
        "Are there other ghosts in the network?",
    ]
    for prompt in creative_prompts:
        res = handle_simulated_command(prompt)
        assert res is None
