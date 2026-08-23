#!/usr/bin/env bash
# Two-player end-to-end check.
#
# Drives two independent browser sessions through a full online match against
# each other. Everything runs in one shell invocation because the sandbox does
# not keep background processes alive between commands.
#
# Clicks go through eval + JS text matching rather than accessibility refs,
# because refs are reassigned on every snapshot and go stale after each DOM
# change — unusable in a scripted run where we can't inspect between steps.

set -uo pipefail
cd "$(dirname "$0")/.."

SHOTS=/projects/sandbox/.kiro/artifacts/screenshots
mkdir -p "$SHOTS"

node server/index.mjs > /tmp/mm-server.log 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 3
curl -s -o /dev/null -w "server: HTTP %{http_code}\n" http://localhost:8787/healthz

A="agent-browser --session pA"
B="agent-browser --session pB"

ev() { # ev <session> <js>
  agent-browser --session "$1" eval "$2" 2>&1 | tail -1
}

click() { # click <session> <regex>
  ev "$1" "(()=>{const b=[...document.querySelectorAll('button')].find(x=>new RegExp('$2','i').test(x.textContent));if(!b)return 'NOT FOUND: $2';b.click();return 'clicked '+b.textContent.trim().slice(0,24)})()"
}

setInput() { # setInput <session> <index> <value>
  ev "$1" "(()=>{const i=document.querySelectorAll('input')[$2];if(!i)return 'no input';const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(i,'$3');i.dispatchEvent(new Event('input',{bubbles:true}));return 'set '+i.value})()"
}

tap() { # tap <session> — the round listens on pointerdown, not click
  ev "$1" "(()=>{const b=document.querySelector('button.cursor-pointer');if(!b)return 'no tap target';b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return 'tapped'})()"
}

heading() { # heading <session> — biggest visible headline, to assert phase
  ev "$1" "(()=>{const h=[...document.querySelectorAll('h1,h2')].map(e=>e.textContent.trim()).filter(Boolean);return h.join(' | ').slice(0,90)})()"
}

for S in pA pB; do
  agent-browser --session $S open "http://localhost:8787/" > /dev/null 2>&1
  agent-browser --session $S set viewport 430 900 > /dev/null 2>&1
  agent-browser --session $S reload > /dev/null 2>&1
done
sleep 4

echo "=== 1. host creates a room ==="
setInput pA 0 "HOST"
click pA "create a room"
sleep 2
CODE=$(ev pA "(()=>[...document.querySelectorAll('.panel.hard-shadow span')].map(s=>s.textContent.trim()).join(''))()" | tr -d '"' | tr -d ' ')
echo "room code: [$CODE]"
if [ ${#CODE} -ne 4 ]; then echo "FAILED to read room code"; exit 1; fi

echo "=== 2. rival joins by code ==="
click pB "i have a code"
sleep 1
setInput pB 0 "$CODE"
sleep 1
click pB "join match"
sleep 3
echo "A sees: $(ev pA "document.body.innerText.replace(/\n+/g,' / ').slice(0,150)")"
echo "B sees: $(ev pB "document.body.innerText.replace(/\n+/g,' / ').slice(0,150)")"
$A screenshot "$SHOTS/e2e-01-host-lobby.png" > /dev/null 2>&1
$B screenshot "$SHOTS/e2e-02-guest-lobby.png" > /dev/null 2>&1

echo "=== 3. host deals the prompt ==="
click pA "deal the prompt"
sleep 3
echo "A heading: $(heading pA)"
echo "B heading: $(heading pB)"

echo "=== 4. both ante up ==="
click pA "ante up"; click pB "ante up"
sleep 3
click pA "use a stand-in"; click pB "use a stand-in"
sleep 4
echo "A heading: $(heading pA)"
echo "B heading: $(heading pB)"
$A screenshot "$SHOTS/e2e-03-armed.png" > /dev/null 2>&1

echo "=== 5. host starts the match ==="
click pA "fight"
sleep 2.6
echo "-- round 1: both jump the gun (deterministic double foul) --"
tap pA; tap pB
sleep 1
echo "A heading: $(heading pA)"
echo "B heading: $(heading pB)"
$A screenshot "$SHOTS/e2e-04-round-a.png" > /dev/null 2>&1
$B screenshot "$SHOTS/e2e-05-round-b.png" > /dev/null 2>&1

sleep 3.4
echo "-- round 2 --"
tap pA; tap pB
sleep 4.5

echo "=== 6. verdict ==="
echo "A heading: $(heading pA)"
echo "B heading: $(heading pB)"
$A screenshot "$SHOTS/e2e-06-verdict-a.png" > /dev/null 2>&1
$B screenshot "$SHOTS/e2e-07-verdict-b.png" > /dev/null 2>&1

echo "=== 7. loser (guest, double-foul ties go to host) chooses to reveal ==="
click pB "collect|face it"
sleep 2
click pB "open the photo"
sleep 2
echo "B heading: $(heading pB)"
echo "A heading: $(heading pA)"

echo "=== 8. did the photo actually relay to the winner? ==="
sleep 5
ev pA "(()=>{const i=[...document.querySelectorAll('img')].filter(x=>x.src.startsWith('data:'));return 'winner sees '+i.length+' relayed image(s)'})()"
ev pB "(()=>{const i=[...document.querySelectorAll('img')].filter(x=>x.src.startsWith('data:'));return 'loser sees '+i.length+' own image(s)'})()"
$A screenshot "$SHOTS/e2e-08-reveal-winner.png" > /dev/null 2>&1
$B screenshot "$SHOTS/e2e-09-reveal-loser.png" > /dev/null 2>&1

echo "=== server log ==="
tail -20 /tmp/mm-server.log
echo "=== healthz ==="
curl -s http://localhost:8787/healthz; echo
echo DONE
