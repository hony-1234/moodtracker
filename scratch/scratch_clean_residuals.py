import os
from PIL import Image

workspace_dir = r"C:\Users\Jerry\.gemini\antigravity\scratch\moodtracker"
folder = os.path.join(workspace_dir, "public", "學校圖檔", "吉祥物")

files_to_clean = [
    "xinxin_left_hand_v7.png",
    "xinxin_right_hand_v7.png",
    "xinxin_body_base_v8.png"
]

def clean_file(filename):
    fpath = os.path.join(folder, filename)
    if not os.path.exists(fpath):
        print(f"File {filename} not found.")
        return
        
    with Image.open(fpath) as img:
        img = img.convert("RGBA")
        width, height = img.size
        
        # Load pixels into a list for easy manipulation
        pixels = list(img.getdata())
        
        # Binary mask: 1 if non-transparent, 0 if transparent
        mask = [1 if p[3] > 0 else 0 for p in pixels]
        
        # Helper to convert (x, y) to index
        def idx(cx, cy):
            return cy * width + cx
            
        labeled = [0] * len(mask)
        current_label = 0
        component_pixels = {} # label -> list of pixel indices
        
        for y in range(height):
            for x in range(width):
                index = idx(x, y)
                if mask[index] == 1 and labeled[index] == 0:
                    current_label += 1
                    # BFS/Flood fill
                    queue = [(x, y)]
                    labeled[index] = current_label
                    comp_list = [index]
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        # 8-neighbors
                        for ny in range(max(0, cy-1), min(height, cy+2)):
                            for nx in range(max(0, cx-1), min(width, cx+2)):
                                n_idx = idx(nx, ny)
                                if mask[n_idx] == 1 and labeled[n_idx] == 0:
                                    labeled[n_idx] = current_label
                                    comp_list.append(n_idx)
                                    queue.append((nx, ny))
                    component_pixels[current_label] = comp_list
                    
        print(f"\nAnalyzing {filename} ({width}x{height}):")
        print(f"Found {current_label} total connected components.")
        
        # Identify components with fewer than 150 pixels as residuals/stray noise
        removed_count = 0
        removed_pixels_total = 0
        
        for label, p_indices in component_pixels.items():
            size = len(p_indices)
            if size < 150:
                # Erase it
                for index in p_indices:
                    pixels[index] = (0, 0, 0, 0)
                removed_count += 1
                removed_pixels_total += size
                print(f"  - Component label {label} is stray noise (size: {size} px) -> ERASED")
            else:
                print(f"  - Component label {label} is MAIN ASSET (size: {size} px) -> KEPT")
                
        if removed_count > 0:
            # Save the cleaned image
            cleaned_img = Image.new("RGBA", (width, height))
            cleaned_img.putdata(pixels)
            cleaned_img.save(fpath, "PNG")
            print(f"  [SUCCESS] Cleaned {filename}: erased {removed_count} stray components ({removed_pixels_total} pixels).")
        else:
            print(f"  [SUCCESS] {filename} is already pristine (0 stray components found).")

for fname in files_to_clean:
    clean_file(fname)
