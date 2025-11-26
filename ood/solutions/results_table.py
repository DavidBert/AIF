import pandas as pd

metrics_df = pd.DataFrame.from_dict(metrics_dict, orient='index')

def highlight_extreme(s):
    # Check if the column is "fpr"
    if s.name == "fpr":
        # Highlight the minimum value
        is_extreme = s == s.min()
    else:
        # Highlight the maximum value
        is_extreme = s == s.max()
    return ['font-weight: bold' if v else '' for v in is_extreme]

# Apply the function to the DataFrame
styled_df = metrics_df.style.apply(highlight_extreme, axis=0)

styled_df