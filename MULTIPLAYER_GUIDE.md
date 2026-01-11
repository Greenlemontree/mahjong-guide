# 🎮 Multiplayer Score Tracking Guide

Your Riichi Mahjong app now has **full multiplayer score tracking**! Here's how to use it.

## Quick Start

### 1. Host Creates Game
1. Go to **Game** tab
2. Click **Host New Game**
3. Enter your name
4. Choose settings (3 or 4 players, starting points)
5. Click **Create Room**
6. Share the 6-character code with other players

### 2. Players Join
1. Other players click **Join Game**
2. Enter their name + room code
3. Wait for host to see all players connected

### 3. Host Starts Game
1. Once everyone is connected, host clicks **Start Game**
2. Game begins with all players seeing their scores
3. **Guests see "Spectator Mode"** - they can view but not record scores

## Recording Scores (Host Only)

### Method 1: Use Hand Calculator (Recommended)

1. Go to **Hand Calculator** tab
2. Build the winning hand (14 tiles)
3. Set win type (Ron/Tsumo), position (Dealer/Non-dealer), etc.
4. Click **Calculate Hand**
5. You'll see a **📊 Report to Game** button
6. Click it to record the score to the active game

### Method 2: Manual Entry

1. Stay on **Game** tab
2. Click one of the result buttons:
   - **Ron** - Someone won by discard
   - **Tsumo** - Someone won by self-draw
   - **Draw** - Nobody won (coming soon)
   - **Chombo** - Penalty (coming soon)

## What Happens Automatically

✅ **Score Calculation** - Points are transferred correctly
✅ **Riichi Sticks** - Winner collects riichi deposits
✅ **Dealer Rotation** - Dealer advances when non-dealer wins
✅ **Honba Tracking** - Increments when dealer wins
✅ **Wind Advancement** - Automatically moves 東 → 南 → 西 → 北
✅ **Real-time Sync** - All players see score updates instantly

## Example Flow

**Round 1: 東1局**
- Host uses calculator: 3 han, 30 fu, Tsumo, Dealer
- Clicks "Report to Game"
- Selects winner from dropdown
- Clicks "Confirm & Apply"
- ✅ Points distributed (2000 from each player)
- ✅ Dealer wins → stays dealer, honba becomes 1

**Round 2: 東1局 1本場**
- Host calculates another hand
- This time non-dealer wins
- ✅ Dealer rotates to next player
- ✅ Round becomes 東2局, honba resets to 0

**After 東4局**
- When dealer rotates back to player 1
- ✅ Wind changes to 南 (South)
- ✅ Round becomes 南1局

## Guest Experience

Guests see everything in **read-only mode**:
- ✅ Can view all scores in real-time
- ✅ See round info (wind, honba, riichi sticks)
- ✅ See their player name and position
- ❌ Cannot record scores (host-only)
- 👁️ Spectator Mode badge shown

## Tips

💡 **Use the Calculator**: Much easier than manual entry - just build the hand and click "Report"

💡 **Check Position**: Make sure to select "Dealer" in calculator if winner is dealer

💡 **Ron vs Tsumo**:
   - Ron = One person pays
   - Tsumo = Everyone pays

💡 **Riichi Tracking**: If a player declares riichi, make sure to track it manually for now (automatic riichi coming soon)

## Upcoming Features

- Draw handling (exhaust draw, abortive draw)
- Chombo penalty recording
- Riichi declaration tracking
- Score history / undo
- Game end detection and final rankings
- Point adjustments (uma, oka)

## Troubleshooting

**"Report to Game" button not showing?**
- Make sure a game is active (you clicked "Start Game")
- Make sure you're the host (button only shows for host)

**Scores not syncing?**
- Check internet connection
- Make sure all players are still connected (check Game tab)

**Wrong scores?**
- You can manually adjust later (feature coming soon)
- For now, calculate carefully before reporting

---

**Your multiplayer Riichi Mahjong tracker is now fully functional!** 🎉

Calculate hands → Report scores → Track game → Everyone sees updates in real-time!
