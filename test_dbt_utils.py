import os
import json
from datetime import datetime, timedelta
import random
import matplotlib.pyplot as plt

class DBTSkillsTracker:
    def __init__(self, data_file="skills_data.json"):
        self.data_file = data_file
        self.skills_data = self.load_data()
    
    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"Error reading {self.data_file}. Creating new data file.")
                return {"logs": []}
        else:
            return {"logs": []}
    
    def save_data(self):
        with open(self.data_file, 'w') as f:
            json.dump(self.skills_data, f, indent=2)
    
    def log_skill(self, skill_type, skill_name, distress_before, distress_after, effectiveness, notes=""):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "skill_type": skill_type,
            "skill_name": skill_name,
            "distress_before": distress_before,
            "distress_after": distress_after,
            "effectiveness": effectiveness,
            "notes": notes
        }
        
        self.skills_data["logs"].append(log_entry)
        self.save_data()
        return log_entry
    
    def get_all_logs(self):
        return self.skills_data["logs"]
    
    def generate_sample_data(self, num_entries=30):
        """Generate sample data for testing purposes"""
        skill_types = {
            "Crisis Survival": ["STOP", "TIP", "Pros and Cons", "ACCEPTS", "Self-Soothe", "IMPROVE"],
            "Reality Acceptance": ["Radical Acceptance", "Turning the Mind", "Willingness", "Half-Smiling", "Mindfulness of Thoughts"]
        }
        
        # Clear existing data
        self.skills_data["logs"] = []
        
        # Generate random entries for the past 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=num_entries)
        
        for i in range(num_entries):
            current_date = start_date + timedelta(days=i)
            
            # Randomly select skill type and name
            skill_type = random.choice(list(skill_types.keys()))
            skill_name = random.choice(skill_types[skill_type])
            
            # Random values for distress and effectiveness
            distress_before = random.randint(50, 90)
            distress_after = random.randint(20, distress_before-10)  # Ensure reduction
            effectiveness = random.randint(1, 5)
            
            # Add the entry
            log_entry = {
                "timestamp": current_date.isoformat(),
                "skill_type": skill_type,
                "skill_name": skill_name,
                "distress_before": distress_before,
                "distress_after": distress_after,
                "effectiveness": effectiveness,
                "notes": f"Sample data entry {i+1}"
            }
            
            self.skills_data["logs"].append(log_entry)
        
        self.save_data()
        return len(self.skills_data["logs"])
    
    def plot_effectiveness_by_skill(self):
        """Plot average effectiveness by skill"""
        logs = self.get_all_logs()
        
        if not logs:
            print("No data available to plot.")
            return
        
        # Calculate average effectiveness for each skill
        skill_effectiveness = {}
        skill_counts = {}
        
        for log in logs:
            skill_name = log["skill_name"]
            effectiveness = log["effectiveness"]
            
            if skill_name not in skill_effectiveness:
                skill_effectiveness[skill_name] = 0
                skill_counts[skill_name] = 0
                
            skill_effectiveness[skill_name] += effectiveness
            skill_counts[skill_name] += 1
        
        # Calculate averages
        avg_effectiveness = {}
        for skill in skill_effectiveness:
            avg_effectiveness[skill] = skill_effectiveness[skill] / skill_counts[skill]
        
        # Sort by effectiveness
        sorted_skills = sorted(avg_effectiveness.items(), key=lambda x: x[1], reverse=True)
        
        # Create lists for plotting
        skills = [item[0] for item in sorted_skills]
        effectiveness_values = [item[1] for item in sorted_skills]
        
        # Create the plot
        plt.figure(figsize=(10, 6))
        bars = plt.barh(skills, effectiveness_values, color='skyblue')
        
        # Add value labels
        for bar in bars:
            width = bar.get_width()
            label_x_pos = width if width > 0 else 0
            plt.text(label_x_pos + 0.1, bar.get_y() + bar.get_height()/2, f'{width:.1f}', 
                     va='center')
        
        plt.xlabel('Average Effectiveness (1-5)')
        plt.title('Average Effectiveness by Skill')
        plt.xlim(0, 5.5)  # Scale is 1-5
        plt.tight_layout()
        
        # Save the plot
        plt.savefig('effectiveness_by_skill.png')
        plt.close()
        
        print("Plot saved as 'effectiveness_by_skill.png'")
        return 'effectiveness_by_skill.png'


# Test the class
if __name__ == "__main__":
    print("DBT Skills Tracker Test Program")
    print("===============================")
    
    tracker = DBTSkillsTracker()
    
    # Check if we have any data
    logs = tracker.get_all_logs()
    if not logs:
        print("\nNo existing data found. Generating sample data...")
        num_entries = tracker.generate_sample_data()
        print(f"Generated {num_entries} sample entries.")
    else:
        print(f"\nFound {len(logs)} existing log entries.")
    
    # Display some stats
    logs = tracker.get_all_logs()
    print("\nRecent skills practice:")
    for log in logs[-5:]:  # Show 5 most recent entries
        date = datetime.fromisoformat(log["timestamp"]).strftime("%Y-%m-%d %H:%M")
        print(f"- {date}: {log['skill_name']} (Effectiveness: {log['effectiveness']}/5)")
    
    # Generate a visualization
    print("\nGenerating effectiveness visualization...")
    plot_file = tracker.plot_effectiveness_by_skill()
    
    print("\nTest complete! Check the current directory for the visualization file.")